"""Assemble walk-cycle into clean transparent PNG sprite sheet using rembg."""

from __future__ import annotations

import io
import json
from pathlib import Path

from PIL import Image
from rembg import remove

SRC = Path(r"C:\Users\kamal\cofounder\Assets\Garden\walk-cycle")
OUT = Path(__file__).resolve().parents[1] / "public" / "planted"
FRAME_COUNT = 5
CHAR_HEIGHT = 165  # normalized character height in px
CANVAS_W = 200
CANVAS_H = 185
FRAME_MS = 240


def cutout(path: Path) -> Image.Image:
    raw = remove(path.read_bytes())
    return Image.open(io.BytesIO(raw)).convert("RGBA")


def bbox(img: Image.Image) -> tuple[int, int, int, int]:
    return img.getbbox() or (0, 0, img.width, img.height)


def normalize(img: Image.Image) -> Image.Image:
    x0, y0, x1, y1 = bbox(img)
    crop = img.crop((x0, y0, x1, y1))
    cw, ch = crop.size
    scale = CHAR_HEIGHT / ch
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = crop.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    ox = (CANVAS_W - nw) // 2
    oy = CANVAS_H - nh - 8  # feet near bottom
    canvas.paste(resized, (ox, oy), resized)
    return canvas


def save_gif(frames: list[Image.Image], path: Path) -> None:
    prepared: list[Image.Image] = []
    for fr in frames:
        p = fr.convert("RGBA")
        alpha = p.getchannel("A")
        rgb = p.convert("RGB")
        pal = rgb.convert("P", palette=Image.ADAPTIVE, colors=255)
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        pal.paste(255, mask)
        prepared.append(pal)

    prepared[0].save(
        path,
        save_all=True,
        append_images=prepared[1:],
        duration=FRAME_MS,
        loop=0,
        disposal=2,
        transparency=255,
        optimize=False,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = sorted(SRC.glob("walk-frame-*.jpg"))[:FRAME_COUNT]
    if len(paths) != FRAME_COUNT:
        raise SystemExit(f"Need {FRAME_COUNT} source frames, found {len(paths)}")

    print("Removing backgrounds with rembg...")
    frames = [normalize(cutout(p)) for p in paths]

    for i, fr in enumerate(frames, start=1):
        fr.save(OUT / f"walk-frame-{i:02d}.png", optimize=True)

    sheet = Image.new("RGBA", (CANVAS_W * len(frames), CANVAS_H), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, (i * CANVAS_W, 0), fr)
    sheet.save(OUT / "walk-sheet.png", optimize=True)
    save_gif(frames, OUT / "walk.gif")

    meta = {
        "frameW": CANVAS_W,
        "frameH": CANVAS_H,
        "frameCount": len(frames),
        "durationMs": FRAME_MS,
        "sheetW": CANVAS_W * len(frames),
    }
    (OUT / "walk-meta.json").write_text(json.dumps(meta), encoding="utf-8")

    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()