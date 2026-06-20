/* Build a V1+V2 IPNS record file for kubo `name put`. */
import fs from "fs";
import * as Name from "w3name";
import {
  createIPNSRecord,
  marshalIPNSRecord,
} from "../node_modules/w3name/node_modules/ipns/dist/src/index.js";

const outPath = process.argv[2];
const keyB64 = process.env.IPNS_SIGNING_KEY_B64?.trim();
if (!outPath) {
  console.error("build-ipns-record: missing output path");
  process.exit(1);
}
if (!keyB64) {
  console.error("build-ipns-record: missing IPNS_SIGNING_KEY_B64");
  process.exit(1);
}

const name = await Name.from(Buffer.from(keyB64, "base64"));
const revision = await Name.resolve(name);
const lifetimeMs = new Date(revision.validity).getTime() - Date.now();
if (lifetimeMs <= 0) {
  console.error("build-ipns-record: w3name validity is in the past");
  process.exit(1);
}

const entry = await createIPNSRecord(
  name.key,
  revision.value,
  revision.sequence,
  lifetimeMs,
  { ttlNs: revision.ttl, v1Compatible: true },
);
const bytes = Buffer.from(marshalIPNSRecord(entry));
fs.writeFileSync(outPath, bytes);
console.error(
  `build-ipns-record: seq=${revision.sequence} value=${revision.value} bytes=${bytes.length}`,
);