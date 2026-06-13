/* ============================================================
   Publish a root IPFS CID to KP's self-owned IPNS name via the
   w3name service (storacha / web3.storage).

   The IPNS private key belongs to KP, not to any provider. The
   w3name service only ever sees signed records, never the key,
   so the name is fully portable. ENS points at ipns://<name>
   exactly once; this script updates where that name resolves on
   every deploy. No gas, no onchain interaction.

   Env:
     IPNS_SIGNING_KEY_B64  base64 of the Ed25519 private key raw
                           bytes (from scripts that generated it).
   Arg:
     process.argv[2]       the new root CID to point the name at.

   Usage: node scripts/publish-ipns.mjs <CID>
   ============================================================ */

import * as Name from "w3name";

const cidArg = process.argv[2];
const keyB64 = process.env.IPNS_SIGNING_KEY_B64;

if (!cidArg) {
  console.error("publish-ipns: missing CID argument");
  process.exit(1);
}
if (!keyB64) {
  console.error("publish-ipns: missing IPNS_SIGNING_KEY_B64 env var");
  process.exit(1);
}

/* Accept a bare CID or a full /ipfs/<cid> path; normalize to a
   gateway-resolvable IPFS path value, which is what IPNS records
   store. */
const cid = cidArg.replace(/^\/ipfs\//, "").trim();
const value = `/ipfs/${cid}`;

const keyBytes = Buffer.from(keyB64, "base64");
const name = await Name.from(keyBytes);

console.log(`publish-ipns: name   = ${name.toString()}`);
console.log(`publish-ipns: value  = ${value}`);

/* Resolve the current record so we can advance the sequence
   number. A fresh name has no record yet, so start at v0. */
let revision;
try {
  const current = await Name.resolve(name);
  if (current.value === value) {
    console.log("publish-ipns: name already points at this CID, nothing to do");
    process.exit(0);
  }
  revision = await Name.increment(current, value);
  console.log(`publish-ipns: updating existing record, seq -> ${revision.sequence}`);
} catch {
  revision = await Name.v0(name, value);
  console.log("publish-ipns: no existing record, publishing first revision (seq 0)");
}

await Name.publish(revision, name.key);
console.log(`publish-ipns: published. Resolve: https://name.web3.storage/name/${name.toString()}`);
console.log(`publish-ipns: ENS contenthash -> ipns://${name.toString()}`);
