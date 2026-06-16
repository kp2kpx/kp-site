import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "cursors", "external-arrow-cursor.png");

/* Standard pointer silhouette, warm ink, transparent bg. 24x24 for
   browser cursor limits. Hotspot at tip: 4, 2 (see globals.css). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="#1c1814" d="M4 2 L4 19 L9 14 L12 21 L15 20 L11 13 L19 13 Z"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log("Wrote", out);