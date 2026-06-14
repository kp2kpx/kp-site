/* Targeted cover fixups: books the broad title search missed.
   Each entry pins an exact Open Library cover id (verified by hand
   from the work's editions) plus the canonical work page URL, so the
   shelf gets a real cover instead of the typographic fallback.
   Merges results into scripts/book-covers.json.
   Run after fetch-book-covers.mjs. No em or en dashes (house style). */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(process.cwd(), "public", "garden", "books");
const MANIFEST = path.join(process.cwd(), "scripts", "book-covers.json");
fs.mkdirSync(OUT, { recursive: true });

/* slug -> { coverId, workUrl }. coverId verified to exist on
   covers.openlibrary.org at large size. */
const FIXUPS = {
  "godel-escher-bach": { coverId: 10668006, work: "/works/OL1881592W" },
  "quantum-mechanics-theoretical-minimum": { coverId: 12207801, work: "/works/OL19333423W" },
  "sapiens": { coverId: 14216844, work: "/works/OL17075811W" },
  "the-iliad": { coverId: 15148531, work: "/works/OL27292338W" },
  // higher resolution editions than the broad search picked
  "black-swan": { coverId: 803354, work: "/works/OL5848502W" },
  "ascent-of-money": { coverId: 13775875, work: "/works/OL14869415W" },
};

/* Books with no cover on Open Library still get a click-through work
   page where one exists. fish-in-alien-streams has no Open Library
   record, so it carries no external link. */
const FALLBACK_WORK_URLS = {
  "theoretical-minimum-classical": "https://openlibrary.org/works/OL16006367W",
  "sapiens-graphic-2": "https://openlibrary.org/works/OL34634534W",
  "gandhi-autobiography": "https://openlibrary.org/works/OL32193455W",
  "tomb-of-sand": "https://openlibrary.org/works/OL28910613W",
};

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [slug, url] of Object.entries(FALLBACK_WORK_URLS)) {
  if (manifest[slug] && !manifest[slug].found && !manifest[slug].workUrl) {
    manifest[slug].workUrl = url;
    console.log(`WORKURL ${slug}  ${url}`);
  }
}

for (const [slug, { coverId, work }] of Object.entries(FIXUPS)) {
  try {
    const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    const res = await fetch(url, { headers: { "User-Agent": "kp-site reading shelf" } });
    if (!res.ok) throw new Error(`cover ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) throw new Error("placeholder");
    const outPath = path.join(OUT, `${slug}.jpg`);
    const info = await sharp(buf)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(outPath);
    const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
    manifest[slug] = {
      found: true,
      coverFile: `/garden/books/${slug}.jpg`,
      workUrl: `https://openlibrary.org${work}`,
    };
    console.log(`OK   ${slug}  ${info.width}x${info.height}  ${kb}KB`);
  } catch (err) {
    console.log(`FAIL ${slug}  ${err.message}`);
  }
  await sleep(350);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
const real = Object.values(manifest).filter((m) => m.found).length;
console.log(`\nManifest updated. real covers now: ${real} / ${Object.keys(manifest).length}`);
