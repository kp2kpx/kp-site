import { unmarshalIPNSRecord } from "../node_modules/w3name/node_modules/ipns/dist/src/utils.js";

const name = process.argv[2];
const cid = process.argv[3]?.replace(/^\/ipfs\//, "");
const seq = process.argv[4] ? BigInt(process.argv[4]) : null;
const publisher =
  process.env.DELEGATED_PUBLISHER ??
  "https://delegated-ipfs.dev/routing/v1/ipns";

if (!name || !cid || seq == null) {
  console.error("usage: verify-delegated-record.mjs <name> <cid> <seq>");
  process.exit(1);
}

const url = `${publisher.replace(/\/$/, "")}/${name}`;
const res = await fetch(url, {
  headers: { Accept: "application/vnd.ipfs.ipns-record" },
});
if (!res.ok) {
  console.error(`verify-delegated-record: HTTP ${res.status}`);
  process.exit(1);
}

const record = unmarshalIPNSRecord(Buffer.from(await res.arrayBuffer()));
const gotCid = String(record.value).replace(/^\/ipfs\//, "").trim();
if (gotCid === cid && record.sequence === seq) {
  console.error(`verify-delegated-record: OK seq=${record.sequence} cid=${gotCid}`);
  process.exit(0);
}
console.error(
  `verify-delegated-record: got seq=${record.sequence} value=${record.value}`,
);
process.exit(1);