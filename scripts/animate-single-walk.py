"""
Animate a single walk illustration: rembg cutout + gentle walk loop.
No website changes. Output to cofounder/Assets/Garden/.
"""

from __future__ import annotations

import io
import math
from pathlib import Path

from PIL import Image
from rembg import remove

SRC = Path(r"C:\Users\kamal\cofounder\Assets\Garden\boy-walk-source.jpg")
OUT_DIR = Path(r"C:\Users\kamal\cofounder\Assets\Garden")
FRAME_COUNT = 8
FRAME_MS = 140
PAD = 24


def cutout(img_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(remove(img_bytes))).convert("RGBA")


def prepare_canvas(img: Image.Image) -> tuple[Image.Image, int, int]:
    bbox = img.getbbox()
    if not bbox:
        raise SystemExit("Cutout failed: empty image")
    crop = img.crop(bbox)
    # room for bob + drift
    canvas = Image.new("RGBA", (crop.width + PAD * 2, crop.height + PAD * 2), (0, 0, 0, 0))
    ox = (canvas.width - crop.width) // 2
    oy = canvas.height - crop.height - 6
    canvas.paste(crop, (ox, oy), crop)
    return canvas, ox, oy


def walk_offset(i: int, total: int) -> tuple[float, float, float]:
    """Return dx, dy, rotate_deg for frame i."""
    t = i / total
    # two-step walk bob synced to horizontal drift
    phase = t * math.tau
    dy = math.sin(phase * 2) * 5.0
    dx = math.sin(phase) * 6.0
    rot = math.sin(phase * 2 + 0.4) * 1.8
    return dx, dy, rot


def render_frame(base: Image.Image, anchor_x: int, anchor_y: int, i: int) -> Image.Image:
    w, h = base.size
    dx, dy, rot = walk_offset(i, FRAME_COUNT)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer.paste(base, (0, 0), base)

    rotated = layer.rotate(rot, resample=Image.BICUBIC, expand=False, center=(anchor_x, anchor_y))
    frame = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ix = int(round(dx))
    iy = int(round(dy))
    frame.paste(rotated, (ix, iy), rotated)
    return frame


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
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Cutting out background...")
    base, ax, ay = prepare_canvas(cutout(SRC.read_bytes()))

    frames = [render_frame(base, ax, ay, i) for i in range(FRAME_COUNT)]
    cutout_path = OUT_DIR / "boy-walk-cutout.png"
    base.save(cutout_path, optimize=True)

    gif_path = OUT_DIR / "boy-walk-animated.gif"
    save_gif(frames, gif_path)

    for i, fr in enumerate(frames):
        fr.save(OUT_DIR / f"boy-walk-anim-{i + 1:02d}.png", optimize=True)

    print(f"wrote {cutout_path}")
    print(f"wrote {gif_path} ({FRAME_COUNT} frames, {FRAME_MS}ms)")


if __name__ == "__main__":
    main()