/* One-off image optimizer for the garden photo set.
   Reads originals from the cofounder Assets/Garden folder, applies
   EXIF orientation, resizes to web-friendly dimensions, and writes
   compressed JPEGs into public/garden so the static IPFS build stays
   light. Re-runnable: safe to run again when more photos arrive.
   Run: node scripts/optimize-garden.mjs */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC = "C:\\Users\\kamal\\cofounder\\Assets\\Garden";
const OUT = path.join(process.cwd(), "public", "garden");

fs.mkdirSync(OUT, { recursive: true });

/* outName -> source file. Landscape capped 1600w, portrait 1200w.
   Some Redmi shots are stored landscape with a portrait subject;
   sharp .rotate() with no arg honours the EXIF orientation tag so
   they come out upright automatically. */
const JOBS = [
  ["goa-coast-monsoon", "IMG_20190719_111351.jpg", 1600],
  ["goa-windblown-palms", "IMG_20190830_185150.jpg", 1600],
  ["goa-rocks-sun", "IMG_20190906_181737.jpg", 1600],
  ["goa-tattoo-cliff", "IMG_20190918_124838.jpg", 1200],
  ["goa-courtyard-dogs", "Screenshot_2019-10-09-15-52-11-369_com.miui.gallery.png", 1600],
  ["cafe-lanterns-night", "IMG_20200316_192720.jpg", 1200],
  ["goa-purple-sunset", "IMG_20200722_191856.jpg", 1600],
  ["himalaya-cliff-swing", "IMG_20210902_103138.jpg", 1200],
  ["himalaya-misty-valley", "IMG_20210912_160510.jpg", 1600],
];

const results = [];
for (const [name, file, maxW] of JOBS) {
  const inPath = path.join(SRC, file);
  if (!fs.existsSync(inPath)) {
    console.log("SKIP (missing):", file);
    continue;
  }
  const outPath = path.join(OUT, `${name}.jpg`);
  const info = await sharp(inPath)
    .rotate() // apply EXIF orientation
    .resize({ width: maxW, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(outPath);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
  results.push({ name, out: `${info.width}x${info.height}`, kb });
  console.log(`${name}.jpg  ${info.width}x${info.height}  ${kb} KB`);
}
console.log("\nDone:", results.length, "images ->", OUT);
