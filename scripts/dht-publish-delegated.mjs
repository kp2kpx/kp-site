/* ============================================================
   Push KP's current w3name IPNS record onto the public DHT via
   the delegated routing HTTP API.

   w3name is the source of truth for CID + sequence. Kubo on CI
   cannot publish with the right sequence (no --seq in v0.39), so
   eth.limo keeps serving stale content. This script fetches the
   already-signed record from w3name and PUTs it to delegated-ipfs,
   which places it on the Amino DHT on our behalf.

   Usage: node scripts/dht-publish-delegated.mjs [<CID>]
   Env:   IPNS_SIGNING_KEY_B64   (verifies name; record from w3name)
          DELEGATED_PUBLISHER    optional, default delegated-ipfs.dev
          W3NAME_ENDPOINT        optional, default name.web3.storage
   ============================================================ */

import * as Name from "w3name";

const EXPECTED_NAME =
  "k51qzi5uqu5dirkws21royn4pbng52n780ezucpigsyahksijsdoybfodpj7zp";
const DELEGATED_PUBLISHER =
  process.env.DELEGATED_PUBLISHER ??
  "https://delegated-ipfs.dev/routing/v1/ipns";
const W3NAME_ENDPOINT =
  process.env.W3NAME_ENDPOINT ?? "https://name.web3.storage/";

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

log(`w3name seq = ${revision.sequence}`);
log(`CID = ${cid}`);
log(`publisher = ${DELEGATED_PUBLISHER}`);

const w3url = new URL(`name/${nameStr}`, W3NAME_ENDPOINT);
const w3res = await fetch(w3url);
if (!w3res.ok) {
  const body = await w3res.text().catch(() => "");
  log(`ERROR w3name fetch failed: HTTP ${w3res.status} ${body}`);
  process.exit(1);
}

const { record } = await w3res.json();
if (!record) {
  log("ERROR w3name response missing record field");
  process.exit(1);
}

const recordBytes = Buffer.from(record, "base64");
if (recordBytes.length < 32) {
  log("ERROR w3name record too small to be a valid IPNS record");
  process.exit(1);
}

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
    const buf = Buffer.from(await getRes.arrayBuffer());
    if (buf.includes(Buffer.from(cid))) {
      recOk = true;
      log(`delegated record check #${i} -> HTTP ${getRes.status}, CID present`);
      break;
    }
  }
  log(`delegated record check #${i} -> waiting for ${cid}`);
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