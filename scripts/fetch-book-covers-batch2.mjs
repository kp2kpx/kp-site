/* Fetch + optimize covers for the 8 books added in batch 2 of the
   Reading shelf (KP-confirmed: Fountainhead, Zarathustra, The Trial,
   The Metamorphosis, Rights of Man, The Art of War, A New History of
   the World, Irrationally Rational).

   Same pipeline as scripts/fetch-book-covers.mjs: query the Open
   Library search API for the best matching work, download the large
   cover, write a web-sized optimized JPEG (400px wide, mozjpeg
   quality 72) into public/garden/books, and merge results into the
   shared scripts/book-covers.json manifest. Books with no cover hit
   are recorded found:false and get the typographic fallback card.

   Re-runnable. Run after fetch-book-covers.mjs (it merges, does not
   overwrite the existing 53). No em or en dashes (house style). */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(process.cwd(), "public", "garden", "books");
const MANIFEST = path.join(process.cwd(), "scripts", "book-covers.json");
fs.mkdirSync(OUT, { recursive: true });

/* slug, title, author. Slug must match node id used in
   src/lib/garden.ts (book-<slug>). */
const BOOKS = [
  ["the-fountainhead", "The Fountainhead", "Ayn Rand"],
  ["thus-spoke-zarathustra", "Thus Spoke Zarathustra", "Friedrich Nietzsche"],
  ["the-trial", "The Trial", "Franz Kafka"],
  ["the-metamorphosis", "The Metamorphosis", "Franz Kafka"],
  ["rights-of-man", "Rights of Man", "Thomas Paine"],
  ["the-art-of-war", "The Art of War", "Sun Tzu"],
  ["new-history-of-the-world", "A New History of the World", "J. M. Roberts"],
  ["irrationally-rational", "Irrationally Rational", "V. Raghunathan"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchBook(title, author) {
  const q = new URLSearchParams({
    title,
    limit: "5",
    fields: "key,title,author_name,cover_i",
  });
  if (author) q.set("author", author);
  const url = `https://openlibrary.org/search.json?${q.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "kp-site reading shelf (kamal.kps@gmail.com)" },
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = await res.json();
  const docs = data.docs ?? [];
  const withCover = docs.find((d) => d.cover_i);
  const best = withCover ?? docs[0];
  return best
    ? { key: best.key, coverId: best.cover_i ?? null }
    : { key: null, coverId: null };
}

async function downloadCover(coverId) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  const res = await fetch(url, {
    headers: { "User-Agent": "kp-site reading shelf (kamal.kps@gmail.com)" },
  });
  if (!res.ok) throw new Error(`cover ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error("cover too small (placeholder)");
  return buf;
}

const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
  : {};
let real = 0;
let fallback = 0;

for (const [slug, title, author] of BOOKS) {
  try {
    const { key, coverId } = await searchBook(title, author);
    const workUrl = key ? `https://openlibrary.org${key}` : null;
    if (coverId) {
      const buf = await downloadCover(coverId);
      const outPath = path.join(OUT, `${slug}.jpg`);
      const info = await sharp(buf)
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(outPath);
      const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
      manifest[slug] = {
        found: true,
        coverFile: `/garden/books/${slug}.jpg`,
        workUrl,
      };
      real++;
      console.log(`OK   ${slug}  ${info.width}x${info.height}  ${kb}KB  ${workUrl}`);
    } else {
      manifest[slug] = { found: false, coverFile: "", workUrl };
      fallback++;
      console.log(`NONE ${slug}  (no cover, typographic fallback)  ${workUrl}`);
    }
  } catch (err) {
    manifest[slug] = { found: false, coverFile: "", workUrl: null };
    fallback++;
    console.log(`FAIL ${slug}  ${err.message}`);
  }
  await sleep(350);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nBatch 2 done. real covers: ${real}  fallback: ${fallback}  total: ${BOOKS.length}`);
console.log("Manifest -> scripts/book-covers.json");
