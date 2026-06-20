/* ============================================================
   Resolve the CURRENT CID that KP's IPNS name points at, by
   reading the signed record from the w3name service. Prints
   exactly one line to stdout:  CID=<cid>  (all logs to stderr),
   so a shell / GitHub Action can capture it.

   Used by the scheduled DHT-reprovide workflow: w3name is the
   source of truth for "what CID is current", and we then push
   that same mapping to the public DHT with kubo so eth.limo and
   ipfs.io/ipns keep resolving between content updates.

   Env:
     IPNS_SIGNING_KEY_B64   base64 raw Ed25519 key (to derive the
                            name; resolving is public but we reuse
                            the key so there is one source of name).
   ============================================================ */

import * as Name from "w3name";

const log = (...a) => console.error("resolve-current-cid:", ...a);

const keyB64 = process.env.IPNS_SIGNING_KEY_B64;
if (!keyB64 || !keyB64.trim()) {
  log("missing IPNS_SIGNING_KEY_B64 env var");
  process.exit(1);
}

const name = await Name.from(Buffer.from(keyB64.trim(), "base64"));
log(`name = ${name.toString()}`);

try {
  const rev = await Name.resolve(name);
  const cid = String(rev.value).replace(/^\/ipfs\//, "").trim();
  if (!cid) {
    log("resolved record had empty value");
    process.exit(1);
  }
  log(`current value = ${rev.value} (seq ${rev.sequence})`);
  console.log(`CID=${cid}`);
  console.log(`SEQ=${rev.sequence}`);
} catch (err) {
  log(`could not resolve w3name record: ${err?.message || err}`);
  process.exit(1);
}
