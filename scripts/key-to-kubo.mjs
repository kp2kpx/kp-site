/* ============================================================
   Convert KP's portable IPNS Ed25519 key (the same key used by
   scripts/publish-ipns.mjs via w3name) into the libp2p protobuf
   marshalled form that `ipfs key import` consumes. This lets the
   public kubo node republish the SAME IPNS name to the DHT, so
   eth.limo / ipfs.io/ipns resolution works (w3name alone only
   serves the record over HTTP, never the DHT).

   The key is read from IPNS_SIGNING_KEY_B64 (preferred, used in
   CI) or from the gitignored secret file as a local fallback. No
   key material is ever printed to stdout or written to a tracked
   path. The protobuf output goes to a path you pass as argv[2],
   which must be gitignored (use a *.bin name).

   Critically: before writing anything we re-derive the IPNS name
   from the key and assert it equals the on-chain name. If a wrong
   key were ever supplied, this aborts instead of publishing a
   record under a name the ENS contenthash does not point at.

   Env:
     IPNS_SIGNING_KEY_B64   base64 of the raw Ed25519 key bytes.
   Arg:
     process.argv[2]        output path for the protobuf key bytes
                            (default: ipns-key.proto.bin, gitignored)

   Usage: node scripts/key-to-kubo.mjs [outfile]
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  privateKeyFromRaw,
  privateKeyFromProtobuf,
  privateKeyToProtobuf,
} from "@libp2p/crypto/keys";
import { base36 } from "multiformats/bases/base36";

const EXPECTED_NAME =
  "k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadKeyB64() {
  const env = process.env.IPNS_SIGNING_KEY_B64;
  if (env && env.trim()) return env.trim();
  // Local fallback only. This file is gitignored and never leaves disk.
  const secretPath = path.join(repoRoot, "IPNS_SIGNING_KEY.secret.txt");
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim();
  }
  console.error(
    "key-to-kubo: no IPNS_SIGNING_KEY_B64 env var and no local secret file",
  );
  process.exit(1);
}

const keyB64 = loadKeyB64();
const keyBytes = Buffer.from(keyB64, "base64");

/* Mirror w3name Name.from(): try raw (priv||pub) first, then fall
   back to a protobuf-marshalled key. Our key is 64 raw bytes. */
let privKey;
try {
  privKey = privateKeyFromRaw(keyBytes);
} catch {
  privKey = privateKeyFromProtobuf(keyBytes);
}

/* Re-derive the IPNS name (base36 libp2p-key CID of the public
   key) and verify it matches the on-chain contenthash name. This
   is exactly how w3name derives name.toString(): the public key's
   CIDv1 (codec 0x72 libp2p-key) rendered in base36. */
const derivedName = privKey.publicKey.toCID().toString(base36);

if (derivedName !== EXPECTED_NAME) {
  console.error("key-to-kubo: DERIVED NAME MISMATCH, aborting.");
  console.error(`  expected: ${EXPECTED_NAME}`);
  console.error(`  derived : ${derivedName}`);
  process.exit(1);
}

const outFile = path.resolve(process.argv[2] || "ipns-key.proto.bin");
const protobuf = privateKeyToProtobuf(privKey); // bytes kubo imports

fs.writeFileSync(outFile, Buffer.from(protobuf));

console.log(`key-to-kubo: name verified = ${derivedName}`);
console.log(`key-to-kubo: wrote libp2p protobuf key -> ${outFile}`);
console.log(`key-to-kubo: ${protobuf.length} bytes (private key material; do not commit)`);
