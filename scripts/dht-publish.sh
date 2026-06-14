#!/usr/bin/env bash
# ============================================================
# Publish KP's IPNS name to the PUBLIC IPFS DHT with kubo, so
# eth.limo and ipfs.io/ipns keep resolving. w3name alone only
# serves the record over HTTP; DHT resolvers need the record put
# onto the Amino DHT. This is the durability fix that stops
# kp2kp.eth from going "Content Unreachable" between updates.
#
# Gasless. Uses the ed25519 content-signing key only (never a
# wallet, never an onchain tx).
#
# Usage:   scripts/dht-publish.sh <CID>
# Env:     IPNS_SIGNING_KEY_B64   base64 raw ed25519 IPNS key.
#          KUBO_VERSION           optional, defaults below.
#
# Requires: node (for scripts/key-to-kubo.mjs), curl, tar.
# Designed for ubuntu-latest GitHub runners.
#
# Note on error handling: we deliberately do NOT use `set -e` /
# pipefail. While the accelerated DHT client warms up, calls like
# `ipfs stats dht` exit non-zero, and `ipfs name publish` may need
# a retry. Under `set -e` those expected non-zero exits would kill
# the script. We check the outcomes we care about explicitly and
# exit non-zero only on a real, final failure.
# ============================================================
set -u

CID="${1:-}"
EXPECTED_NAME="k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"
KUBO_VERSION="${KUBO_VERSION:-v0.39.0}"

fail() { echo "dht-publish: ERROR $*" >&2; exit 1; }

[ -n "$CID" ] || fail "missing CID argument"
[ -n "${IPNS_SIGNING_KEY_B64:-}" ] || fail "missing IPNS_SIGNING_KEY_B64 env var"

CID="${CID#/ipfs/}"
WORK="$(mktemp -d)"
export IPFS_PATH="$WORK/repo"
KEYBIN="$WORK/ipns-key.proto.bin"
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

# --- init isolated repo, accelerated DHT client for fast reliable puts ---
mkdir -p "$IPFS_PATH"
"$IPFS" init --profile server >&2 || fail "ipfs init failed"
"$IPFS" config Routing.Type dht >&2
"$IPFS" config --json Routing.AcceleratedDHTClient true >&2

# --- import the key under a known name, assert it is the on-chain name ---
"$IPFS" key import kpsite "$KEYBIN" >&2 || fail "key import failed"
KEYLINE="$("$IPFS" key list -l | awk '$2=="kpsite"{print $1}')"
echo "dht-publish: imported key id = $KEYLINE" >&2
[ "$KEYLINE" = "$EXPECTED_NAME" ] || fail "key name mismatch (got $KEYLINE)"
# protobuf key no longer needed once imported
rm -f "$KEYBIN" 2>/dev/null || true

# --- start daemon ---
"$IPFS" daemon --enable-gc=false >"$WORK/daemon.log" 2>&1 &
DAEMON_PID=$!

# wait for API
up=""
for i in $(seq 1 60); do
  if "$IPFS" id >/dev/null 2>&1; then up="yes"; break; fi
  sleep 2
done
[ "$up" = "yes" ] || { tail -n 60 "$WORK/daemon.log" >&2; fail "daemon never came up"; }
echo "dht-publish: daemon up" >&2

# wait for the accelerated DHT routing table to fill. `stats dht`
# exits non-zero while it warms up, so swallow failures and just
# look at the peer count. Cap the wait; publish proceeds regardless.
peers=0
for i in $(seq 1 60); do
  out="$("$IPFS" stats dht 2>/dev/null || true)"
  n="$(printf '%s\n' "$out" | sed -n 's/.*DHT wan (\([0-9]\+\) peers).*/\1/p' | head -n1)"
  case "$n" in (''|*[!0-9]*) n=0 ;; esac
  peers="$n"
  if [ "$peers" -ge 100 ]; then break; fi
  sleep 10
done
echo "dht-publish: DHT wan routing table peers = $peers" >&2

# --- publish the record to the DHT, with a couple of retries ---
published=""
for attempt in 1 2 3; do
  if "$IPFS" name publish --key=kpsite --lifetime=8760h --ttl=1h "/ipfs/${CID}" >&2; then
    published="yes"; break
  fi
  echo "dht-publish: publish attempt $attempt failed, retrying in 20s" >&2
  sleep 20
done
[ "$published" = "yes" ] || fail "name publish failed after retries"
echo "dht-publish: published /ipns/${EXPECTED_NAME} -> /ipfs/${CID}" >&2

# --- give the put a moment to land, then re-provide the key explicitly
#     so it is well seeded on the DHT before the daemon shuts down ---
"$IPFS" routing provide "/ipns/${EXPECTED_NAME}" >/dev/null 2>&1 || true

# --- verify on a public resolver (best effort, do not hard-fail CI on
#     gateway propagation lag; the DHT put above is the durable action) ---
ok=""
for i in $(seq 1 10); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 40 "https://ipfs.io/ipns/${EXPECTED_NAME}/" || true)"
  echo "dht-publish: ipfs.io/ipns check #$i -> HTTP ${code}" >&2
  if [ "$code" = "200" ]; then ok="yes"; break; fi
  sleep 15
done
if [ "$ok" = "yes" ]; then
  echo "dht-publish: VERIFIED live on ipfs.io/ipns" >&2
else
  echo "dht-publish: WARN gateway not 200 yet; record is on the DHT, propagation can lag" >&2
fi

exit 0
