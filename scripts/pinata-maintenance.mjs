/* ============================================================
   Pinata maintenance: usage report + stale-pin cleanup.

   Why this exists: the deploy pipeline pins a NEW root CID on
   every push but never unpinned the previous one, so the free
   plan filled with stale duplicate copies of the site. This
   script reports usage and unpins everything EXCEPT an explicit
   keep-list of CIDs (the current live CID plus one rollback).

   It is intentionally allowlist-based: it never targets a CID to
   delete by name, it keeps the ones you name and removes the
   rest. That makes an accidental over-delete impossible to do
   silently: if KEEP is wrong, the script refuses to run.

   Env:
     PINATA_JWT   Pinata API JWT (scoped key with pinList,
                  unpin, userPinnedDataTotal permissions).
     KEEP         comma-separated CIDs to KEEP (required for
                  --apply). Whitespace tolerant.

   Modes:
     (default)    dry run: report usage + list pins + show what
                  WOULD be unpinned. Changes nothing.
     --apply      actually unpin every pin whose CID is not in KEEP.

   All human output goes to stderr; nothing is destructive
   without --apply.
   ============================================================ */

import process from "node:process";

const JWT = process.env.PINATA_JWT;
const APPLY = process.argv.includes("--apply");
const KEEP = (process.env.KEEP || "")
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

const BASE = "https://api.pinata.cloud";
const H = { Authorization: `Bearer ${JWT}` };
const log = (...a) => console.error(...a);

if (!JWT) {
  log("ERROR: missing PINATA_JWT env var");
  process.exit(1);
}

const fmtGB = (bytes) => `${(bytes / 1e9).toFixed(4)} GB (${bytes} bytes)`;

async function usage() {
  const res = await fetch(`${BASE}/data/userPinnedDataTotal`, { headers: H });
  if (!res.ok) throw new Error(`userPinnedDataTotal ${res.status}: ${await res.text()}`);
  return res.json(); // { pin_count, pin_size_total, pin_size_with_replications_total }
}

async function listAllPins() {
  // pinList is paginated; pageLimit max 1000. Only active pins.
  const all = [];
  let offset = 0;
  const pageLimit = 1000;
  for (;;) {
    const url = `${BASE}/data/pinList?status=pinned&pageLimit=${pageLimit}&pageOffset=${offset}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) throw new Error(`pinList ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const rows = json.rows || [];
    all.push(...rows);
    if (rows.length < pageLimit) break;
    offset += pageLimit;
  }
  return all;
}

async function unpin(cid) {
  const res = await fetch(`${BASE}/pinning/unpin/${cid}`, { method: "DELETE", headers: H });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Pinata returns an error if a CID is already unpinned; treat that as success.
    if (/not pinned|already/i.test(body)) return { cid, ok: true, note: "already unpinned" };
    return { cid, ok: false, note: `${res.status}: ${body}` };
  }
  return { cid, ok: true };
}

const before = await usage();
log("=== Pinata account usage (current) ===");
log(`  pin_count:      ${before.pin_count}`);
log(`  pin_size_total: ${fmtGB(before.pin_size_total)}`);
log("");

const pins = await listAllPins();
log(`=== Active pins: ${pins.length} ===`);
for (const p of pins) {
  const keep = KEEP.includes(p.ipfs_pin_hash);
  log(
    `  ${keep ? "KEEP  " : "unpin "}${p.ipfs_pin_hash}  ${String(p.size).padStart(9)} B  ${p.date_pinned}  ${p.metadata?.name || ""}`,
  );
}
log("");

const toUnpin = pins.filter((p) => !KEEP.includes(p.ipfs_pin_hash)).map((p) => p.ipfs_pin_hash);

if (!APPLY) {
  log("DRY RUN. No changes made.");
  log(`KEEP list (${KEEP.length}): ${KEEP.join(", ") || "(empty)"}`);
  log(`Would unpin ${toUnpin.length} pins. Re-run with --apply and KEEP set to execute.`);
  process.exit(0);
}

// --apply guardrails: refuse to run with an empty or non-matching keep-list.
if (KEEP.length === 0) {
  log("REFUSING to --apply with empty KEEP. Set KEEP to the live CID(s).");
  process.exit(1);
}
const keepPresent = KEEP.filter((c) => pins.some((p) => p.ipfs_pin_hash === c));
if (keepPresent.length === 0) {
  log("REFUSING: none of the KEEP CIDs are currently pinned. Check the CIDs.");
  log(`KEEP: ${KEEP.join(", ")}`);
  process.exit(1);
}
log(`KEEP CIDs confirmed pinned: ${keepPresent.join(", ")}`);
log(`Unpinning ${toUnpin.length} stale pins...`);

let okCount = 0;
const failures = [];
for (const cid of toUnpin) {
  const r = await unpin(cid);
  if (r.ok) {
    okCount++;
    log(`  unpinned ${cid}${r.note ? ` (${r.note})` : ""}`);
  } else {
    failures.push(r);
    log(`  FAILED   ${cid} -> ${r.note}`);
  }
}

log("");
const after = await usage();
log("=== Pinata account usage (after cleanup) ===");
log(`  pin_count:      ${after.pin_count}`);
log(`  pin_size_total: ${fmtGB(after.pin_size_total)}`);
log("");
log(`Unpinned ${okCount}/${toUnpin.length}. Failures: ${failures.length}.`);
if (failures.length) {
  log(JSON.stringify(failures, null, 2));
  process.exit(1);
}
