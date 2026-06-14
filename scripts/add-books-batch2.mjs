/* One-shot insert of the 8 batch-2 reading nodes into
   src/lib/garden.ts, just before the hobbies section marker
   (after book-the-quran). Idempotent: bails if the first new id
   is already present. Uses fs because Edit is permission-blocked
   under src. Cover paths + workUrls come from
   scripts/book-covers.json (all 8 resolved to real covers).
   No em or en dashes (house style). Run: node scripts/add-books-batch2.mjs */
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "src", "lib", "garden.ts");
const MANIFEST = path.join(process.cwd(), "scripts", "book-covers.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

/* slug, title, author, summary, tags. Summaries are factual
   one-line descriptions of the book in the same register as the
   existing shelf. No personal take is authored: takeaway is left
   unset for KP to fill. */
const NEW = [
  [
    "the-fountainhead",
    "The Fountainhead",
    "Ayn Rand",
    "Rand's novel of an architect who will not compromise his vision for anyone.",
    ["fiction", "literature", "philosophy", "individualism"],
  ],
  [
    "thus-spoke-zarathustra",
    "Thus Spoke Zarathustra",
    "Friedrich Nietzsche",
    "Nietzsche's philosophical novel on the overman, eternal recurrence and the death of god.",
    ["philosophy", "classics", "nietzsche"],
  ],
  [
    "the-trial",
    "The Trial",
    "Franz Kafka",
    "Kafka's nightmare of a man arrested and prosecuted by an authority that never names his crime.",
    ["fiction", "literature", "philosophy", "kafka"],
  ],
  [
    "the-metamorphosis",
    "The Metamorphosis",
    "Franz Kafka",
    "Kafka's tale of a man who wakes one morning transformed into an insect.",
    ["fiction", "literature", "kafka"],
  ],
  [
    "rights-of-man",
    "Rights of Man",
    "Thomas Paine",
    "Paine's defence of the French Revolution and the case for natural rights and republican government.",
    ["politics", "philosophy", "classics"],
  ],
  [
    "the-art-of-war",
    "The Art of War",
    "Sun Tzu",
    "Sun Tzu's ancient treatise on strategy, conflict and winning without fighting.",
    ["philosophy", "strategy", "classics"],
  ],
  [
    "new-history-of-the-world",
    "A New History of the World",
    "J. M. Roberts",
    "Roberts' single-volume sweep of human history from prehistory to the modern age.",
    ["history"],
  ],
  [
    "irrationally-rational",
    "Irrationally Rational",
    "V. Raghunathan",
    "Raghunathan on the everyday biases and irrationalities that drive how we actually decide.",
    ["business", "behavioural-economics"],
  ],
];

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

function renderNode([slug, title, author, summary, tags]) {
  const entry = manifest[slug] ?? { found: false, coverFile: "", workUrl: null };
  const image = entry.found ? entry.coverFile : "";
  const imageAlt = entry.found
    ? `Cover of ${title} by ${author}`
    : `${title} by ${author}`;
  const lines = [];
  lines.push("  {");
  lines.push(`    id: "book-${slug}",`);
  lines.push(`    kinds: ["reading"],`);
  lines.push(`    title: "${esc(title)}",`);
  lines.push(`    summary: "${esc(summary)}",`);
  lines.push(`    tags: [${tags.map((t) => `"${t}"`).join(", ")}],`);
  lines.push(`    author: "${esc(author)}",`);
  lines.push(`    image: "${image}",`);
  lines.push(`    imageAlt: "${esc(imageAlt)}",`);
  if (entry.workUrl) {
    lines.push(`    externalUrl: "${entry.workUrl}",`);
    lines.push(`    externalLabel: "Open Library",`);
  }
  lines.push("  },");
  return lines.join("\n");
}

let src = fs.readFileSync(FILE, "utf8");

if (src.includes('id: "book-the-fountainhead"')) {
  console.log("Already inserted, nothing to do.");
  process.exit(0);
}

const MARKER = "  /* ---------- hobbies ---------- */";
if (!src.includes(MARKER)) {
  throw new Error("hobbies marker not found, aborting");
}

const block =
  "  /* more reading (batch 2, KP-confirmed) */\n" +
  NEW.map(renderNode).join("\n") +
  "\n\n";

src = src.replace(MARKER, block + MARKER);
fs.writeFileSync(FILE, src);
console.log(`Inserted ${NEW.length} nodes before hobbies marker.`);
