/* ============================================================
   Pin the static export directory (out/) to IPFS via Pinata,
   preserving the full directory tree, and print the root CID.

   Uses the stable pinFileToIPFS endpoint with native fetch +
   FormData (no extra deps). Each part's filename carries the
   file's path relative to out/, which is how Pinata rebuilds
   the folder structure (so /_next/static/... resolves on a
   gateway). cidVersion 1 for modern, case-safe gateway paths.

   Env:
     PINATA_JWT   Pinata API JWT (scoped key with pinning).
   Arg:
     process.argv[2]  directory to pin (default: out)

   Prints exactly one line to stdout:  CID=<root cid>
   so the GitHub Action can capture it. All logs go to stderr.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.argv[2] || "out");
const JWT = process.env.PINATA_JWT;
const ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const log = (...a) => console.error("pin-pinata:", ...a);

if (!JWT) {
  log("missing PINATA_JWT env var");
  process.exit(1);
}
if (!fs.existsSync(DIR) || !fs.statSync(DIR).isDirectory()) {
  log(`directory not found: ${DIR}`);
  process.exit(1);
}

/* Recursively collect every file under DIR with its path
   relative to DIR's parent's basename root, so the wrapping
   directory name is consistent. */
/* Next static export also emits App Router flight *.txt payloads
   for client transitions. IPFS gateways serve full HTML pages, so
   those files are not needed on kp2kp.eth and they blow past
   Pinata's free-tier file cap (500) for this site. */
function shouldPin(rel) {
  return !rel.endsWith(".txt");
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) {
      const rel = path.relative(DIR, full).split(path.sep).join("/");
      if (shouldPin(rel)) out.push(full);
    }
  }
  return out;
}

const WRAP = "site"; // common top-level folder; returned CID is this directory
const files = walk(DIR);
if (files.length === 0) {
  log("no files to pin");
  process.exit(1);
}
log(`pinning ${files.length} files from ${DIR}`);

const form = new FormData();
for (const full of files) {
  const rel = path.relative(DIR, full).split(path.sep).join("/");
  const data = fs.readFileSync(full);
  // Part filename = <WRAP>/<relative path>. Pinata builds one
  // directory named WRAP and returns its CID, so <CID>/index.html
  // is the homepage and kp2kp.eth serves the site at its root.
  form.append("file", new Blob([data]), `${WRAP}/${rel}`);
}

form.append(
  "pinataOptions",
  JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }),
);
form.append(
  "pinataMetadata",
  JSON.stringify({ name: `kp-site-${process.env.GITHUB_SHA?.slice(0, 7) || "local"}` }),
);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { Authorization: `Bearer ${JWT}` },
  body: form,
});

if (!res.ok) {
  const body = await res.text().catch(() => "");
  log(`Pinata error ${res.status}: ${body}`);
  process.exit(1);
}

const json = await res.json();
const cid = json.IpfsHash;
if (!cid) {
  log("no IpfsHash in Pinata response:", JSON.stringify(json));
  process.exit(1);
}

log(`pinned. root CID = ${cid}`);
log(`gateway: https://gateway.pinata.cloud/ipfs/${cid}/`);
// The ONLY stdout line, for the Action to capture:
console.log(`CID=${cid}`);
