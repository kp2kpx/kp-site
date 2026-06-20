/* Builds a portrait poster for the cyclone-week video embed.
   No ffmpeg here, so rather than a true frame grab we use the
   storm-palms photo (same era, same weather) cropped to the
   video's 470x854 portrait ratio and dimmed slightly so a play
   button reads on top. Cheap, on-theme, and keeps the page from
   flashing a black box before the user taps play.
   Run: node scripts/make-video-poster.mjs */
import sharp from "sharp";
import path from "node:path";

const SRC = "C:\\Users\\kamal\\cofounder\\Assets\\Garden\\IMG_20190830_185150.jpg";
const OUT = path.join(process.cwd(), "public", "garden", "cafe-cyclone-week-poster.jpg");

const info = await sharp(SRC)
  .rotate()
  .resize({ width: 720, height: 1280, fit: "cover", position: "attention" })
  .modulate({ brightness: 0.82 })
  .jpeg({ quality: 72, mozjpeg: true })
  .toFile(OUT);

console.log(`poster ${info.width}x${info.height} -> ${OUT}`);
