#!/usr/bin/env bash
# ============================================================
# Publish KP's IPNS name to the PUBLIC IPFS network so eth.limo
# and ipfs.io/ipns keep resolving.
#
# w3name holds the signed record (correct CID + sequence). This
# wrapper forwards to scripts/dht-publish-delegated.mjs, which
# PUTs that record to delegated-ipfs.dev so it lands on the DHT.
#
# Gasless. ed25519 content-signing key only. No wallet, no onchain.
#
# Usage:   scripts/dht-publish.sh [<CID>]
# Env:     IPNS_SIGNING_KEY_B64   base64 raw ed25519 IPNS key.
#          DELEGATED_PUBLISHER    optional delegated routing base.
#          W3NAME_ENDPOINT        optional w3name API base URL.
# ============================================================
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/dht-publish-delegated.mjs" "${1:-}"