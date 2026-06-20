#!/usr/bin/env bash
# ============================================================
# Publish KP's signed IPNS record to the public DHT via kubo's
# delegated HTTP publisher. w3name is the source of truth for
# CID + sequence; we rebuild the V1+V2 record locally and
# `ipfs name put` it with --allow-delegated.
#
# Usage:   scripts/dht-publish.sh [<CID>]
# Env:     IPNS_SIGNING_KEY_B64
#          KUBO_VERSION           default v0.42.0
#          DELEGATED_PUBLISHER
# ============================================================
set -u

CID="${1:-}"
CID="${CID#/ipfs/}"
EXPECTED_NAME="k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KUBO_VERSION="${KUBO_VERSION:-v0.42.0}"
DELEGATED_PUBLISHER="${DELEGATED_PUBLISHER:-https://delegated-ipfs.dev/routing/v1/ipns}"

fail() { echo "dht-publish: ERROR $*" >&2; exit 1; }

[ -n "${IPNS_SIGNING_KEY_B64:-}" ] || fail "missing IPNS_SIGNING_KEY_B64 env var"

resolve_out="$(node "$SCRIPT_DIR/resolve-current-cid.mjs" 2>/dev/null || true)"
W3_CID="$(echo "$resolve_out" | grep '^CID=' | cut -d= -f2 || true)"
W3_SEQ="$(echo "$resolve_out" | grep '^SEQ=' | cut -d= -f2 || true)"
[ -n "$W3_CID" ] || fail "could not resolve CID from w3name"
[ -n "$W3_SEQ" ] || fail "could not resolve sequence from w3name"
if [ -n "$CID" ] && [ "$CID" != "$W3_CID" ]; then
  echo "dht-publish: WARN arg CID $CID != w3name $W3_CID; publishing w3name value" >&2
fi
CID="$W3_CID"

echo "dht-publish: w3name seq = $W3_SEQ" >&2
echo "dht-publish: CID = $CID" >&2
echo "dht-publish: kubo = $KUBO_VERSION" >&2
echo "dht-publish: publisher = $DELEGATED_PUBLISHER" >&2

WORK="$(mktemp -d)"
export IPFS_PATH="$WORK/repo"
RECORDFILE="$WORK/ipns.record"
DAEMON_PID=""

cleanup() {
  if [ -n "$DAEMON_PID" ] && kill -0 "$DAEMON_PID" 2>/dev/null; then
    kill "$DAEMON_PID" 2>/dev/null || true
    wait "$DAEMON_PID" 2>/dev/null || true
  fi
  rm -rf "$WORK" 2>/dev/null || true
}
trap cleanup EXIT

TARBALL="kubo_${KUBO_VERSION}_linux-amd64.tar.gz"
curl -fsSL "https://dist.ipfs.tech/kubo/${KUBO_VERSION}/${TARBALL}" -o "$WORK/kubo.tar.gz" \
  || fail "kubo download failed"
tar -xzf "$WORK/kubo.tar.gz" -C "$WORK" || fail "kubo extract failed"
IPFS="$WORK/kubo/ipfs"
"$IPFS" --version >&2 || fail "kubo binary not runnable"

node "$SCRIPT_DIR/build-ipns-record.mjs" "$RECORDFILE" >&2 || fail "record build failed"

mkdir -p "$IPFS_PATH"
"$IPFS" init --profile server >&2 || fail "ipfs init failed"
"$IPFS" config Routing.Type auto >&2
"$IPFS" config --json Ipns.DelegatedPublishers "[\"${DELEGATED_PUBLISHER}\"]" >&2
"$IPFS" config Plugins.Plugins.telemetry.Config.Mode off >&2

IPFS_TELEMETRY=off "$IPFS" daemon --enable-gc=false >"$WORK/daemon.log" 2>&1 &
DAEMON_PID=$!
up=""
for i in $(seq 1 60); do
  if "$IPFS" id >/dev/null 2>&1; then up="yes"; break; fi
  sleep 2
done
[ "$up" = "yes" ] || { tail -n 60 "$WORK/daemon.log" >&2; fail "daemon never came up"; }
echo "dht-publish: daemon up" >&2

PUT_ARGS=(name put)
if "$IPFS" name put --help 2>&1 | grep -q -- '--allow-delegated'; then
  PUT_ARGS+=(--allow-delegated)
fi
PUT_ARGS+=("$EXPECTED_NAME" "$RECORDFILE")

published=""
for attempt in 1 2 3 4 5; do
  if "$IPFS" "${PUT_ARGS[@]}" >&2; then
    published="yes"; break
  fi
  echo "dht-publish: name put attempt $attempt failed, retrying in 15s" >&2
  sleep 15
done
[ "$published" = "yes" ] || { tail -n 40 "$WORK/daemon.log" >&2; fail "name put failed after retries"; }
echo "dht-publish: put /ipns/${EXPECTED_NAME} -> /ipfs/${CID}" >&2

rec_ok=""
for i in $(seq 1 24); do
  if node "$SCRIPT_DIR/verify-delegated-record.mjs" "$EXPECTED_NAME" "$CID" "$W3_SEQ" >&2; then
    rec_ok="yes"
    echo "dht-publish: delegated record check #$i -> OK" >&2
    break
  fi
  echo "dht-publish: delegated record check #$i -> waiting" >&2
  sleep 15
done
[ "$rec_ok" = "yes" ] || fail "delegated IPNS record did not update to ${CID}"

ok=""
for i in $(seq 1 24); do
  roots="$(curl -sI --max-time 40 "https://ipfs.io/ipns/${EXPECTED_NAME}/" \
    | tr -d '\r' | awk -F': ' 'tolower($1)=="x-ipfs-roots"{print $2; exit}' || true)"
  echo "dht-publish: ipfs.io/ipns check #$i -> roots=${roots:-<none>}" >&2
  if [ "$roots" = "$CID" ]; then ok="yes"; break; fi
  sleep 20
done
[ "$ok" = "yes" ] || fail "ipfs.io/ipns roots did not match ${CID} (got ${roots:-<none>})"
echo "dht-publish: VERIFIED ipfs.io/ipns -> ${CID}" >&2

exit 0