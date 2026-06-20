/* Fetch + optimize book covers for the Reading shelf.

   For each book in BOOKS, query the Open Library search API to find
   the best matching work, grab its cover image id, download the
   large cover, and write a web-sized optimized JPEG into
   public/garden/books. Emits a JSON manifest (scripts/book-covers.json)
   mapping each book slug to { coverFile, workUrl, found } so the
   garden node data can be wired up by hand afterwards.

   Covers ship to IPFS, so they are kept modest: 400px wide, mozjpeg
   quality 72. Books with no cover hit on Open Library are recorded
   with found:false and get a typographic fallback card in the UI.

   Re-runnable. Run: node scripts/fetch-book-covers.mjs
   No em or en dashes anywhere in this file (house style). */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(process.cwd(), "public", "garden", "books");
fs.mkdirSync(OUT, { recursive: true });

/* slug, title, author (for query). Slug must match the node id used
   in src/lib/garden.ts (book-<slug>). isbn is an optional hint that
   pins an exact edition when the title search is ambiguous. */
const BOOKS = [
  // Science & physics
  ["godel-escher-bach", "Godel Escher Bach An Eternal Golden Braid", "Douglas Hofstadter"],
  ["fabric-of-reality", "The Fabric of Reality", "David Deutsch"],
  ["beginning-of-infinity", "The Beginning of Infinity", "David Deutsch"],
  ["brief-history-of-time", "A Brief History of Time", "Stephen Hawking"],
  ["short-history-nearly-everything", "A Short History of Nearly Everything", "Bill Bryson"],
  ["singularity-is-nearer", "The Singularity Is Nearer", "Ray Kurzweil"],
  ["theoretical-minimum-classical", "The Theoretical Minimum", "Leonard Susskind"],
  ["quantum-mechanics-theoretical-minimum", "Quantum Mechanics The Theoretical Minimum", "Leonard Susskind"],
  ["black-swan", "The Black Swan", "Nassim Nicholas Taleb"],
  ["algorithms-to-live-by", "Algorithms to Live By", "Brian Christian"],
  ["origin-of-species", "The Origin of Species", "Charles Darwin"],
  // Philosophy
  ["critique-of-pure-reason", "The Critique of Pure Reason", "Immanuel Kant"],
  ["the-prophet", "The Prophet", "Kahlil Gibran"],
  ["nausea", "Nausea", "Jean-Paul Sartre"],
  // Money, business, tech
  ["richest-man-in-babylon", "The Richest Man in Babylon", "George S. Clason"],
  ["wealth-of-nations", "The Wealth of Nations", "Adam Smith"],
  ["capital", "Capital", "Karl Marx"],
  ["ascent-of-money", "The Ascent of Money", "Niall Ferguson"],
  ["almanack-of-naval", "The Almanack of Naval Ravikant", "Eric Jorgenson"],
  ["zero-to-one", "Zero to One", "Peter Thiel"],
  ["same-as-ever", "Same as Ever", "Morgan Housel"],
  ["read-write-own", "Read Write Own", "Chris Dixon"],
  ["hard-thing-about-hard-things", "The Hard Thing About Hard Things", "Ben Horowitz"],
  // History, politics
  ["sapiens", "Sapiens A Brief History of Humankind", "Yuval Noah Harari"],
  ["nexus", "Nexus", "Yuval Noah Harari"],
  ["sapiens-graphic-1", "Sapiens A Graphic History The Birth of Humankind", "Yuval Noah Harari"],
  ["sapiens-graphic-2", "Sapiens A Graphic History The Pillars of Civilization", "Yuval Noah Harari"],
  ["silk-roads", "The Silk Roads", "Peter Frankopan"],
  ["end-of-history", "The End of History and the Last Man", "Francis Fukuyama"],
  ["two-treatises-of-government", "Two Treatises of Government", "John Locke"],
  ["train-to-pakistan", "Train to Pakistan", "Khushwant Singh"],
  ["mein-kampf", "Mein Kampf", "Adolf Hitler"],
  ["gandhi-autobiography", "An Autobiography The Story of My Experiments with Truth", "Mohandas Gandhi"],
  ["autobiography-malcolm-x", "The Autobiography of Malcolm X", "Malcolm X"],
  ["marx-returns", "Marx Returns", "Jason Barker"],
  // Fiction, literature
  ["demons", "Demons", "Fyodor Dostoevsky"],
  ["brothers-karamazov", "The Brothers Karamazov", "Fyodor Dostoevsky"],
  ["war-and-peace", "War and Peace", "Leo Tolstoy"],
  ["anna-karenina", "Anna Karenina", "Leo Tolstoy"],
  ["the-iliad", "The Iliad", "Homer Caroline Alexander"],
  ["the-odyssey", "The Odyssey", "Homer"],
  ["ulysses", "Ulysses", "James Joyce"],
  ["labyrinths", "Labyrinths", "Jorge Luis Borges"],
  ["to-kill-a-mockingbird", "To Kill a Mockingbird", "Harper Lee"],
  ["tale-of-two-cities", "A Tale of Two Cities", "Charles Dickens"],
  ["mountain-shadow", "The Mountain Shadow", "Gregory David Roberts"],
  ["tomb-of-sand", "Tomb of Sand", "Geetanjali Shree"],
  ["sita-warrior-of-mithila", "Sita Warrior of Mithila", "Amish Tripathi"],
  ["hitchhikers-guide", "The Hitchhiker's Guide to the Galaxy", "Douglas Adams"],
  ["watchmen", "Watchmen", "Alan Moore"],
  ["fish-in-alien-streams", "A Fish in Alien Streams", "Herjinder"],
  ["life-keith-richards", "Life", "Keith Richards"],
  ["the-quran", "The Quran", ""],
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
  // pick the first doc that actually has a cover id
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
  // Open Library returns a tiny 1x1 / blank placeholder for missing
  // covers sometimes; guard against trivially small payloads.
  if (buf.length < 2000) throw new Error("cover too small (placeholder)");
  return buf;
}

const manifest = {};
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
      console.log(`OK   ${slug}  ${info.width}x${info.height}  ${kb}KB`);
    } else {
      manifest[slug] = { found: false, coverFile: "", workUrl };
      fallback++;
      console.log(`NONE ${slug}  (no cover, typographic fallback)`);
    }
  } catch (err) {
    manifest[slug] = { found: false, coverFile: "", workUrl: null };
    fallback++;
    console.log(`FAIL ${slug}  ${err.message}`);
  }
  await sleep(350); // be polite to Open Library
}

fs.writeFileSync(
  path.join(process.cwd(), "scripts", "book-covers.json"),
  JSON.stringify(manifest, null, 2)
);
console.log(`\nDone. real covers: ${real}  fallback: ${fallback}  total: ${BOOKS.length}`);
console.log("Manifest -> scripts/book-covers.json");
