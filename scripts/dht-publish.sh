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
# ============================================================
set -euo pipefail

CID="${1:-}"
EXPECTED_NAME="k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"
KUBO_VERSION="${KUBO_VERSION:-v0.39.0}"

if [ -z "$CID" ]; then
  echo "dht-publish: missing CID argument" >&2
  exit 1
fi
if [ -z "${IPNS_SIGNING_KEY_B64:-}" ]; then
  echo "dht-publish: missing IPNS_SIGNING_KEY_B64 env var" >&2
  exit 1
fi

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
curl -fsSL "https://dist.ipfs.tech/kubo/${KUBO_VERSION}/${TARBALL}" -o "$WORK/kubo.tar.gz"
tar -xzf "$WORK/kubo.tar.gz" -C "$WORK"
IPFS="$WORK/kubo/ipfs"
"$IPFS" --version >&2

# --- convert the portable key to kubo protobuf form (verifies name) ---
node scripts/key-to-kubo.mjs "$KEYBIN" >&2

# --- init isolated repo, accelerated DHT client for fast reliable puts ---
mkdir -p "$IPFS_PATH"
"$IPFS" init --profile server >&2
"$IPFS" config Routing.Type dht >&2
"$IPFS" config --json Routing.AcceleratedDHTClient true >&2

# --- import the key under a known name, assert it is the on-chain name ---
"$IPFS" key import kpsite "$KEYBIN" >&2
KEYLINE="$("$IPFS" key list -l | awk '$2=="kpsite"{print $1}')"
echo "dht-publish: imported key id = $KEYLINE" >&2
if [ "$KEYLINE" != "$EXPECTED_NAME" ]; then
  echo "dht-publish: KEY NAME MISMATCH, aborting (got $KEYLINE)" >&2
  exit 1
fi
# protobuf key no longer needed once imported
rm -f "$KEYBIN" 2>/dev/null || true

# --- start daemon ---
"$IPFS" daemon --enable-gc=false >"$WORK/daemon.log" 2>&1 &
DAEMON_PID=$!

# wait for API
for i in $(seq 1 60); do
  if "$IPFS" id >/dev/null 2>&1; then break; fi
  sleep 2
done
"$IPFS" id >/dev/null 2>&1 || { echo "dht-publish: daemon never came up" >&2; tail -n 40 "$WORK/daemon.log" >&2; exit 1; }
echo "dht-publish: daemon up" >&2

# wait for the accelerated DHT routing table to fill (needs a few minutes)
for i in $(seq 1 60); do
  PEERS="$("$IPFS" stats dht 2>/dev/null | sed -n 's/.*DHT wan (\([0-9]\+\) peers).*/\1/p' | head -n1)"
  PEERS="${PEERS:-0}"
  if [ "$PEERS" -ge 100 ]; then break; fi
  sleep 10
done
echo "dht-publish: DHT wan routing table peers = ${PEERS:-0}" >&2

# --- publish the record to the DHT ---
"$IPFS" name publish --key=kpsite --lifetime=8760h --ttl=1h "/ipfs/${CID}" >&2
echo "dht-publish: published /ipns/${EXPECTED_NAME} -> /ipfs/${CID}" >&2

# --- verify on a public resolver (best effort, do not hard-fail CI on
#     gateway propagation lag; the DHT put above is the durable action) ---
OK=""
for i in $(seq 1 10); do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 40 "https://ipfs.io/ipns/${EXPECTED_NAME}/" || true)"
  echo "dht-publish: ipfs.io/ipns check #$i -> HTTP ${CODE}" >&2
  if [ "$CODE" = "200" ]; then OK="yes"; break; fi
  sleep 15
done
if [ "$OK" = "yes" ]; then
  echo "dht-publish: VERIFIED live on ipfs.io/ipns" >&2
else
  echo "dht-publish: WARN gateway not 200 yet; record is on the DHT, propagation can lag" >&2
fi
