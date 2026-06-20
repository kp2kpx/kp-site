#!/usr/bin/env bash
# ============================================================
# Publish KP's IPNS name to the PUBLIC IPFS network so eth.limo
# and ipfs.io/ipns keep resolving.
#
# GitHub-hosted runners cannot build a usable Amino DHT routing
# table, so we publish via kubo's delegated HTTP publisher.
# w3name supplies the live sequence; kubo >=0.37 needs
# --sequence (not --seq) or the DHT ignores the record.
#
# Usage:   scripts/dht-publish.sh <CID>
# Env:     IPNS_SIGNING_KEY_B64
#          KUBO_VERSION           default v0.42.0
#          DELEGATED_PUBLISHER
#          CAR_GATEWAYS
# ============================================================
set -u

CID="${1:-}"
CID="${CID#/ipfs/}"
EXPECTED_NAME="k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KUBO_VERSION="${KUBO_VERSION:-v0.42.0}"
DELEGATED_PUBLISHER="${DELEGATED_PUBLISHER:-https://delegated-ipfs.dev/routing/v1/ipns}"
CAR_GATEWAYS="${CAR_GATEWAYS:-https://dweb.link https://ipfs.io https://trustless-gateway.link}"

fail() { echo "dht-publish: ERROR $*" >&2; exit 1; }

[ -n "$CID" ] || fail "missing CID argument"
[ -n "${IPNS_SIGNING_KEY_B64:-}" ] || fail "missing IPNS_SIGNING_KEY_B64 env var"

W3_SEQ=""
resolve_out="$(node "$SCRIPT_DIR/resolve-current-cid.mjs" 2>/dev/null || true)"
W3_CID="$(echo "$resolve_out" | grep '^CID=' | cut -d= -f2 || true)"
W3_SEQ="$(echo "$resolve_out" | grep '^SEQ=' | cut -d= -f2 || true)"
if [ -n "$W3_CID" ] && [ "$W3_CID" != "$CID" ]; then
  echo "dht-publish: WARN arg CID $CID != w3name $W3_CID; publishing w3name value" >&2
  CID="$W3_CID"
fi
[ -n "$W3_SEQ" ] || fail "could not read IPNS sequence from w3name"
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
  rm -rf "$WORK" 2>/dev/null || true
}
trap cleanup EXIT

echo "dht-publish: CID = $CID" >&2
echo "dht-publish: kubo = $KUBO_VERSION" >&2
echo "dht-publish: publisher = $DELEGATED_PUBLISHER" >&2

TARBALL="kubo_${KUBO_VERSION}_linux-amd64.tar.gz"
curl -fsSL "https://dist.ipfs.tech/kubo/${KUBO_VERSION}/${TARBALL}" -o "$WORK/kubo.tar.gz" \
  || fail "kubo download failed"
tar -xzf "$WORK/kubo.tar.gz" -C "$WORK" || fail "kubo extract failed"
IPFS="$WORK/kubo/ipfs"
"$IPFS" --version >&2 || fail "kubo binary not runnable"

node scripts/key-to-kubo.mjs "$KEYBIN" >&2 || fail "key conversion failed"

mkdir -p "$IPFS_PATH"
"$IPFS" init --profile server >&2 || fail "ipfs init failed"
"$IPFS" config Routing.Type auto >&2
"$IPFS" config --json Ipns.DelegatedPublishers "[\"${DELEGATED_PUBLISHER}\"]" >&2
"$IPFS" config Plugins.Plugins.telemetry.Config.Mode off >&2

"$IPFS" key import kpsite "$KEYBIN" >&2 || fail "key import failed"
KEYLINE="$("$IPFS" key list -l | awk '$2=="kpsite"{print $1}')"
echo "dht-publish: imported key id = $KEYLINE" >&2
[ "$KEYLINE" = "$EXPECTED_NAME" ] || fail "key name mismatch (got $KEYLINE)"
rm -f "$KEYBIN" 2>/dev/null || true

got_car=""
for gw in $CAR_GATEWAYS; do
  echo "dht-publish: fetching CAR from $gw" >&2
  if curl -fsSL -H "Accept: application/vnd.ipld.car" --max-time 300 \
       "${gw}/ipfs/${CID}?format=car" -o "$CARFILE" && [ -s "$CARFILE" ]; then
    sz="$(wc -c < "$CARFILE" | tr -d ' ')"
    if [ "$sz" -gt 1000 ]; then got_car="yes"; echo "dht-publish: CAR ${sz} bytes" >&2; break; fi
  fi
  echo "dht-publish: CAR fetch from $gw did not yield a usable car" >&2
done
[ "$got_car" = "yes" ] || fail "could not fetch a CAR for $CID"

IPFS_TELEMETRY=off "$IPFS" daemon --enable-gc=false >"$WORK/daemon.log" 2>&1 &
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

published=""
for attempt in 1 2 3 4 5; do
  if "$IPFS" name publish --key=kpsite --allow-delegated \
       --sequence="$W3_SEQ" --lifetime=8760h --ttl=1h "/ipfs/${CID}" >&2; then
    published="yes"; break
  fi
  echo "dht-publish: publish attempt $attempt failed, retrying in 15s" >&2
  sleep 15
done
[ "$published" = "yes" ] || { tail -n 40 "$WORK/daemon.log" >&2; fail "name publish failed after retries"; }
echo "dht-publish: published /ipns/${EXPECTED_NAME} -> /ipfs/${CID}" >&2

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