#!/usr/bin/env bash
# ============================================================
# Publish KP's IPNS name to the PUBLIC IPFS network so eth.limo
# and ipfs.io/ipns keep resolving. The w3name service only serves
# the record over HTTP; DHT-based resolvers need it on the Amino
# DHT, which is why kp2kp.eth went "Content Unreachable" before.
#
# Why this uses a DELEGATED HTTP publisher, not a direct DHT put:
#   GitHub-hosted runners are ephemeral and NAT'd; they cannot
#   build a usable Amino DHT routing table (an isolated runner
#   sees ~0 DHT peers), so a direct `name publish` over the DHT
#   hangs or fails. Instead we:
#     1. Pull the full DAG for the CID as a CAR from a trustless
#        gateway and `ipfs dag import` it, so the node holds the
#        blocks locally (required for an offline publish).
#     2. Point Ipns.DelegatedPublishers at the public delegated
#        routing endpoint (https://delegated-ipfs.dev/routing/v1/ipns).
#     3. `ipfs name publish --allow-delegated` signs the record
#        with KP's ed25519 key and PUTs it to that endpoint over
#        HTTP, which places it on the DHT on our behalf. No local
#        DHT connectivity needed. The endpoint only ever sees a
#        signed record, never the key.
#
# Gasless. ed25519 content-signing key only. No wallet, no onchain.
#
# Usage:   scripts/dht-publish.sh <CID>
# Env:     IPNS_SIGNING_KEY_B64   base64 raw ed25519 IPNS key.
#          KUBO_VERSION           optional, defaults below.
#          DELEGATED_PUBLISHER    optional, override endpoint.
#          CAR_GATEWAYS           optional, space-separated CAR
#                                 gateway base URLs to try in order.
#
# Requires: node (for scripts/key-to-kubo.mjs), curl, tar.
#
# Error handling: no `set -e`/pipefail. We check each real step
# explicitly and only fail on a final failure.
# ============================================================
set -u

CID="${1:-}"
CID="${CID#/ipfs/}"
EXPECTED_NAME="k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KUBO_VERSION="${KUBO_VERSION:-v0.39.0}"
DELEGATED_PUBLISHER="${DELEGATED_PUBLISHER:-https://delegated-ipfs.dev/routing/v1/ipns}"
CAR_GATEWAYS="${CAR_GATEWAYS:-https://dweb.link https://ipfs.io https://trustless-gateway.link}"

fail() { echo "dht-publish: ERROR $*" >&2; exit 1; }

[ -n "$CID" ] || fail "missing CID argument"
[ -n "${IPNS_SIGNING_KEY_B64:-}" ] || fail "missing IPNS_SIGNING_KEY_B64 env var"

# w3name is the source of truth for the live sequence. Ephemeral CI
# kubo starts with seq 0, so a bare `name publish` is ignored by the
# DHT when a higher record already exists — eth.limo keeps the old site.
W3_SEQ=""
if [ -n "${IPNS_SIGNING_KEY_B64:-}" ]; then
  resolve_out="$(node "$SCRIPT_DIR/resolve-current-cid.mjs" 2>/dev/null || true)"
  W3_CID="$(echo "$resolve_out" | grep '^CID=' | cut -d= -f2 || true)"
  W3_SEQ="$(echo "$resolve_out" | grep '^SEQ=' | cut -d= -f2 || true)"
  if [ -n "$W3_CID" ] && [ "$W3_CID" != "$CID" ]; then
    echo "dht-publish: WARN arg CID $CID != w3name $W3_CID; publishing w3name value" >&2
    CID="$W3_CID"
  fi
fi
[ -n "$W3_SEQ" ] || fail "could not read IPNS sequence from w3name (needed for DHT publish)"
echo "dht-publish: w3name seq = $W3_SEQ" >&2

WORK="$(mktemp -d)"
export IPFS_PATH="$WORK/repo"
KEYBIN="$WORK/ipns-key.proto.bin"
CARFILE="$WORK/site.car"
DAEMON_PID=""

cleanup() {
  if [ -n "$DAEMON_PID" ] && kill -0 "$DAEMON_PID" 2>/dev/null; then
    kill "$DAEMON_PID" 2>/dev/null || true
    wait "$DAEMON_PID" 2>/dev/null || true
  fi
  # Scrub the protobuf key material from disk no matter what.
  rm -rf "$WORK" 2>/dev/null || true
}
trap cleanup EXIT

echo "dht-publish: CID = $CID" >&2
echo "dht-publish: kubo = $KUBO_VERSION" >&2
echo "dht-publish: publisher = $DELEGATED_PUBLISHER" >&2

# --- install kubo ---
ARCH="amd64"
TARBALL="kubo_${KUBO_VERSION}_linux-${ARCH}.tar.gz"
curl -fsSL "https://dist.ipfs.tech/kubo/${KUBO_VERSION}/${TARBALL}" -o "$WORK/kubo.tar.gz" \
  || fail "kubo download failed"
tar -xzf "$WORK/kubo.tar.gz" -C "$WORK" || fail "kubo extract failed"
IPFS="$WORK/kubo/ipfs"
"$IPFS" --version >&2 || fail "kubo binary not runnable"

# --- convert the portable key to kubo protobuf form (verifies name) ---
node scripts/key-to-kubo.mjs "$KEYBIN" >&2 || fail "key conversion failed"

# --- init isolated repo. Explicit delegated publisher endpoint so we
#     do not depend on AutoConf expanding the "auto" placeholder. ---
mkdir -p "$IPFS_PATH"
"$IPFS" init --profile server >&2 || fail "ipfs init failed"
"$IPFS" config Routing.Type auto >&2
"$IPFS" config --json Ipns.DelegatedPublishers "[\"${DELEGATED_PUBLISHER}\"]" >&2

# --- import the key under a known name, assert it is the on-chain name ---
"$IPFS" key import kpsite "$KEYBIN" >&2 || fail "key import failed"
KEYLINE="$("$IPFS" key list -l | awk '$2=="kpsite"{print $1}')"
echo "dht-publish: imported key id = $KEYLINE" >&2
[ "$KEYLINE" = "$EXPECTED_NAME" ] || fail "key name mismatch (got $KEYLINE)"
rm -f "$KEYBIN" 2>/dev/null || true

# --- fetch the full DAG for the CID as a CAR and import it, so the
#     blocks are local (offline publish needs the target present) ---
got_car=""
for gw in $CAR_GATEWAYS; do
  echo "dht-publish: fetching CAR from $gw" >&2
  if curl -fsSL -H "Accept: application/vnd.ipld.car" --max-time 300 \
       "${gw}/ipfs/${CID}?format=car" -o "$CARFILE" && [ -s "$CARFILE" ]; then
    # sanity: a CAR is at least a few hundred bytes; error pages are tiny html
    sz="$(wc -c < "$CARFILE" | tr -d ' ')"
    if [ "$sz" -gt 1000 ]; then got_car="yes"; echo "dht-publish: CAR ${sz} bytes" >&2; break; fi
  fi
  echo "dht-publish: CAR fetch from $gw did not yield a usable car" >&2
done
[ "$got_car" = "yes" ] || fail "could not fetch a CAR for $CID from any gateway"

# --- start daemon (delegated publish still needs the daemon running) ---
"$IPFS" daemon --enable-gc=false >"$WORK/daemon.log" 2>&1 &
DAEMON_PID=$!
up=""
for i in $(seq 1 60); do
  if "$IPFS" id >/dev/null 2>&1; then up="yes"; break; fi
  sleep 2
done
[ "$up" = "yes" ] || { tail -n 60 "$WORK/daemon.log" >&2; fail "daemon never came up"; }
echo "dht-publish: daemon up" >&2

"$IPFS" dag import "$CARFILE" >&2 || fail "dag import failed"
"$IPFS" block stat --offline "$CID" >/dev/null 2>&1 || fail "root block missing after import"
echo "dht-publish: DAG imported, root block local" >&2

# --- publish offline via the delegated publisher, with retries ---
published=""
for attempt in 1 2 3 4 5; do
  if "$IPFS" name publish --key=kpsite --allow-delegated \
       --seq="$W3_SEQ" --lifetime=8760h --ttl=1h "/ipfs/${CID}" >&2; then
    published="yes"; break
  fi
  echo "dht-publish: publish attempt $attempt failed, retrying in 15s" >&2
  sleep 15
done
[ "$published" = "yes" ] || { tail -n 40 "$WORK/daemon.log" >&2; fail "name publish failed after retries"; }
echo "dht-publish: published /ipns/${EXPECTED_NAME} -> /ipfs/${CID}" >&2

# --- verify the delegated endpoint serves a record for our CID ---
rec_ok=""
for i in $(seq 1 12); do
  tmprec="$WORK/delegated-record.bin"
  code="$(curl -s -o "$tmprec" -w '%{http_code}' --max-time 30 \
    -H "Accept: application/vnd.ipfs.ipns-record" \
    "${DELEGATED_PUBLISHER%/}/${EXPECTED_NAME}" || true)"
  if [ "$code" = "200" ] && [ -s "$tmprec" ] && grep -aq "$CID" "$tmprec" 2>/dev/null; then
    rec_ok="yes"
    echo "dht-publish: delegated record check #$i -> HTTP ${code}, CID present" >&2
    break
  fi
  echo "dht-publish: delegated record check #$i -> HTTP ${code} (waiting for ${CID})" >&2
  sleep 10
done
[ "$rec_ok" = "yes" ] || fail "delegated IPNS record did not update to ${CID}"

# --- verify public resolvers point at the same root CID (eth.limo uses this path) ---
ok=""
for i in $(seq 1 20); do
  roots="$(curl -sI --max-time 40 "https://ipfs.io/ipns/${EXPECTED_NAME}/" \
    | tr -d '\r' | awk -F': ' 'tolower($1)=="x-ipfs-roots"{print $2; exit}' || true)"
  echo "dht-publish: ipfs.io/ipns check #$i -> roots=${roots:-<none>}" >&2
  if [ "$roots" = "$CID" ]; then ok="yes"; break; fi
  sleep 15
done
[ "$ok" = "yes" ] || fail "ipfs.io/ipns roots did not match ${CID} (got ${roots:-<none>})"
echo "dht-publish: VERIFIED ipfs.io/ipns -> ${CID}" >&2

exit 0
