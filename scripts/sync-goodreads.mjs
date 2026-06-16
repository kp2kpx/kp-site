/* Sync Reading shelf to Goodreads: covers + detail links.

   Uses Goodreads book/auto_complete (public JSON). Downloads large
   covers from i.gr-assets.com into public/garden/books, then patches
   src/lib/garden.ts externalUrl / externalLabel for every book node.

   Run: node scripts/sync-goodreads.mjs
   No em or en dashes in this file (house style). */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const GARDEN = path.join(ROOT, "src", "lib", "garden.ts");
const OUT = path.join(ROOT, "public", "garden", "books");
const MANIFEST = path.join(ROOT, "scripts", "goodreads-manifest.json");

fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseBookNodes(ts) {
  const books = [];
  const blocks = ts.split(/(?=\n  \{\n    id: "book-)/);
  for (const block of blocks) {
    if (!block.includes('id: "book-')) continue;
    const slug = block.match(/id: "book-([^"]+)"/)?.[1];
    const title = block.match(/\n    title: "([^"]+)"/)?.[1];
    const author = block.match(/\n    author: "([^"]*)"/)?.[1] ?? "";
    if (slug && title) books.push({ slug, title, author });
  }
  return books;
}

function junkTitle(t) {
  const s = t.toLowerCase();
  return (
    s.includes("summary and analysis") ||
    s.startsWith("summary of") ||
    s.includes(" instaread") ||
    s.includes("finish in one sitting") ||
    s.includes("digest & review") ||
    s.includes("sparknotes") ||
    s.includes("cliffsnotes") ||
    s.includes("study guide") ||
    s.includes("by eric jorgenson tools of titans")
  );
}

function authorMatches(result, author) {
  if (!author?.trim()) return true;
  const a = author.toLowerCase();
  const r = (result.author?.name ?? "").toLowerCase();
  if (!r) return true;
  const aParts = a.split(/[\s,&]+/).filter((p) => p.length > 2);
  const rParts = r.split(/[\s.&]+/).filter((p) => p.length > 2);
  return aParts.some((p) => r.includes(p)) || rParts.some((p) => a.includes(p));
}

function titleScore(result, title) {
  const t = title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const r = (result.bookTitleBare || result.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
  const words = t.split(/\s+/).filter((w) => w.length > 3);
  if (!words.length) return 0;
  let hit = 0;
  for (const w of words) if (r.includes(w)) hit++;
  return hit / words.length;
}

function pickBest(results, title, author) {
  const pool = results.filter((r) => !junkTitle(r.bookTitleBare || r.title || ""));
  const withAuthor = pool.filter((r) => authorMatches(r, author));
  const candidates = withAuthor.length ? withAuthor : pool;
  candidates.sort((a, b) => titleScore(b, title) - titleScore(a, title));
  return candidates[0] ?? results[0] ?? null;
}

function largeCoverUrl(url) {
  if (!url) return null;
  return url.replace(/\._S[XY]\d+_/i, "._SY475_");
}

async function autocomplete(title, author) {
  const q = author ? `${title} ${author}` : title;
  const url = `https://www.goodreads.com/book/auto_complete?format=json&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "kp-site reading shelf (kamal.kps@gmail.com)" },
  });
  if (!res.ok) throw new Error(`autocomplete ${res.status}`);
  return res.json();
}

async function downloadCover(imageUrl) {
  const url = largeCoverUrl(imageUrl);
  const res = await fetch(url, {
    headers: { "User-Agent": "kp-site reading shelf (kamal.kps@gmail.com)" },
  });
  if (!res.ok) throw new Error(`cover ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error("cover too small");
  return buf;
}

const gardenTs = fs.readFileSync(GARDEN, "utf8");
const books = parseBookNodes(gardenTs);
console.log(`Books in garden.ts: ${books.length}`);

const manifest = {};
let ok = 0;
let noCover = 0;
let fail = 0;

for (const { slug, title, author } of books) {
  try {
    const results = await autocomplete(title, author);
    const best = pickBest(results, title, author);
    if (!best?.bookUrl) throw new Error("no match");
    const goodreadsUrl = `https://www.goodreads.com${best.bookUrl.split("?")[0]}`;
    let coverFile = "";
    if (best.imageUrl) {
      try {
        const buf = await downloadCover(best.imageUrl);
        const outPath = path.join(OUT, `${slug}.jpg`);
        await sharp(buf)
          .resize({ width: 400, withoutEnlargement: true })
          .jpeg({ quality: 72, mozjpeg: true })
          .toFile(outPath);
        coverFile = `/garden/books/${slug}.jpg`;
        ok++;
        console.log(`OK   ${slug}`);
      } catch (coverErr) {
        noCover++;
        console.log(`COVER ${slug}  ${coverErr.message}  (link ok)`);
      }
    } else {
      noCover++;
      console.log(`NOCOVER ${slug}`);
    }
    manifest[slug] = {
      goodreadsUrl,
      goodreadsTitle: best.bookTitleBare || best.title,
      coverFile,
      bookId: best.bookId,
    };
  } catch (err) {
    fail++;
    manifest[slug] = { error: err.message };
    console.log(`FAIL ${slug}  ${err.message}`);
  }
  await sleep(280);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

let patched = fs.readFileSync(GARDEN, "utf8");
patched = patched.replace(/externalLabel: "Open Library"/g, 'externalLabel: "Goodreads"');
for (const [slug, data] of Object.entries(manifest)) {
  if (!data.goodreadsUrl) continue;
  const blockRe = new RegExp(`(id: "book-${slug}"[\\s\\S]*?)(\\n  \\},)`);
  const block = patched.match(blockRe)?.[1];
  if (!block) continue;
  let next = block;
  if (/externalUrl: "/.test(block)) {
    next = block.replace(/externalUrl: "[^"]+"/, `externalUrl: "${data.goodreadsUrl}"`);
  } else {
    next = block.replace(
      /(imageAlt: "[^"]+",)\n/,
      `$1\n    externalUrl: "${data.goodreadsUrl}",\n`
    );
  }
  if (!/externalLabel: "/.test(next)) {
    next = next.replace(/\n(  \},)/, '\n    externalLabel: "Goodreads",$1');
  }
  patched = patched.replace(blockRe, `${next}$2`);
}

patched = patched.replace(
  /Open Library Covers API into \/garden\/books \(see[\s\S]*?page so a curious reader can click through\./,
  "Goodreads covers into /garden/books (see scripts/sync-goodreads.mjs). " +
    "externalUrl is the Goodreads book page so a curious reader can click through."
);

fs.writeFileSync(GARDEN, patched);
console.log(`\nDone. covers: ${ok}  noCover: ${noCover}  fail: ${fail}`);
console.log(`Manifest -> scripts/goodreads-manifest.json`);
console.log(`Patched -> src/lib/garden.ts`);