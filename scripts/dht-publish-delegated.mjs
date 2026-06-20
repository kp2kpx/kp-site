/* ============================================================
   Push KP's current IPNS mapping onto the public DHT via the
   delegated routing HTTP API.

   w3name is the source of truth for CID + sequence. The record
   bytes stored by w3name are V2-only; DHT resolvers (eth.limo,
   ipfs.io) still serve older V1+V2 records until we publish a
   fresh V1-compatible record signed with the correct sequence.

   Usage: node scripts/dht-publish-delegated.mjs [<CID>]
   Env:   IPNS_SIGNING_KEY_B64
          DELEGATED_PUBLISHER    optional
          W3NAME_ENDPOINT        optional
   ============================================================ */

import * as Name from "w3name";
import {
  createIPNSRecord,
  marshalIPNSRecord,
} from "../node_modules/w3name/node_modules/ipns/dist/src/index.js";
import { unmarshalIPNSRecord } from "../node_modules/w3name/node_modules/ipns/dist/src/utils.js";

const EXPECTED_NAME =
  "k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp";
const DELEGATED_PUBLISHER =
  process.env.DELEGATED_PUBLISHER ??
  "https://delegated-ipfs.dev/routing/v1/ipns";

const log = (...args) => console.error("dht-publish:", ...args);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cidArg = process.argv[2]?.replace(/^\/ipfs\//, "").trim();
const keyB64 = process.env.IPNS_SIGNING_KEY_B64?.trim();
if (!keyB64) {
  log("ERROR missing IPNS_SIGNING_KEY_B64 env var");
  process.exit(1);
}

const name = await Name.from(Buffer.from(keyB64, "base64"));
const nameStr = name.toString();
if (nameStr !== EXPECTED_NAME) {
  log(`ERROR key name mismatch (got ${nameStr})`);
  process.exit(1);
}

const revision = await Name.resolve(name);
const cid = String(revision.value).replace(/^\/ipfs\//, "").trim();
if (!cid) {
  log("ERROR w3name resolved to empty CID");
  process.exit(1);
}
if (cidArg && cidArg !== cid) {
  log(`WARN arg CID ${cidArg} != w3name ${cid}; publishing w3name value`);
}

const lifetimeMs = new Date(revision.validity).getTime() - Date.now();
if (lifetimeMs <= 0) {
  log("ERROR w3name record validity is in the past");
  process.exit(1);
}

log(`w3name seq = ${revision.sequence}`);
log(`CID = ${cid}`);
log(`publisher = ${DELEGATED_PUBLISHER}`);

const entry = await createIPNSRecord(
  name.key,
  revision.value,
  revision.sequence,
  lifetimeMs,
  { ttlNs: revision.ttl, v1Compatible: true },
);
const recordBytes = Buffer.from(marshalIPNSRecord(entry));
log(`record bytes = ${recordBytes.length} (v1+v2)`);

const putUrl = `${DELEGATED_PUBLISHER.replace(/\/$/, "")}/${nameStr}`;
let published = false;
for (let attempt = 1; attempt <= 5; attempt++) {
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/vnd.ipfs.ipns-record" },
    body: recordBytes,
  });
  if (putRes.ok) {
    published = true;
    break;
  }
  const errText = await putRes.text().catch(() => "");
  log(`publish attempt ${attempt} failed: HTTP ${putRes.status} ${errText}`);
  await sleep(15_000);
}
if (!published) {
  log("ERROR delegated IPNS PUT failed after retries");
  process.exit(1);
}
log(`published /ipns/${nameStr} -> /ipfs/${cid}`);

let recOk = false;
for (let i = 1; i <= 12; i++) {
  const getRes = await fetch(putUrl, {
    headers: { Accept: "application/vnd.ipfs.ipns-record" },
  });
  if (getRes.ok) {
    const got = unmarshalIPNSRecord(Buffer.from(await getRes.arrayBuffer()));
    const gotCid = String(got.value).replace(/^\/ipfs\//, "").trim();
    if (gotCid === cid && got.sequence === revision.sequence) {
      recOk = true;
      log(
        `delegated record check #${i} -> seq ${got.sequence}, value ${got.value}`,
      );
      break;
    }
    log(
      `delegated record check #${i} -> seq ${got.sequence}, value ${got.value}`,
    );
  } else {
    log(`delegated record check #${i} -> HTTP ${getRes.status}`);
  }
  await sleep(10_000);
}
if (!recOk) {
  log(`ERROR delegated IPNS record did not update to ${cid}`);
  process.exit(1);
}

let ok = false;
let roots = "";
for (let i = 1; i <= 20; i++) {
  const res = await fetch(`https://ipfs.io/ipns/${nameStr}/`, {
    method: "HEAD",
    redirect: "follow",
  });
  roots = res.headers.get("x-ipfs-roots") ?? "";
  log(`ipfs.io/ipns check #${i} -> roots=${roots || "<none>"}`);
  if (roots === cid) {
    ok = true;
    break;
  }
  await sleep(15_000);
}
if (!ok) {
  log(`ERROR ipfs.io/ipns roots did not match ${cid} (got ${roots || "<none>"})`);
  process.exit(1);
}
log(`VERIFIED ipfs.io/ipns -> ${cid}`);