"""Build 5-frame transparent walk cycle from matched source frames."""

from __future__ import annotations

import io
import json
import shutil
from pathlib import Path

from PIL import Image
from rembg import remove

# frame 1 = user's approved image; 2-5 = generated
FRAME1 = Path(r"C:\Users\kamal\cofounder\Assets\Garden\boy-walk-source.jpg")
GENERATED = [
    Path(r"C:\Users\kamal\.grok\sessions\C%3A%5CUsers%5Ckamal\019eca9a-2386-7f12-a535-96e504f522c2\images\12.jpg"),
    Path(r"C:\Users\kamal\.grok\sessions\C%3A%5CUsers%5Ckamal\019eca9a-2386-7f12-a535-96e504f522c2\images\13.jpg"),
    Path(r"C:\Users\kamal\.grok\sessions\C%3A%5CUsers%5Ckamal\019eca9a-2386-7f12-a535-96e504f522c2\images\15.jpg"),
    Path(r"C:\Users\kamal\.grok\sessions\C%3A%5CUsers%5Ckamal\019eca9a-2386-7f12-a535-96e504f522c2\images\14.jpg"),
]
OUT = Path(r"C:\Users\kamal\cofounder\Assets\Garden\walk-cycle-v2")
CHAR_HEIGHT = 320
CANVAS_W = 380
CANVAS_H = 340
FRAME_MS = 220


def cutout(path: Path) -> Image.Image:
    return Image.open(io.BytesIO(remove(path.read_bytes()))).convert("RGBA")


def normalize(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        raise ValueError("empty cutout")
    crop = img.crop(bbox)
    cw, ch = crop.size
    scale = CHAR_HEIGHT / ch
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = crop.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    ox = (CANVAS_W - nw) // 2
    oy = CANVAS_H - nh - 12
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
    sources = [FRAME1, *GENERATED]

    for i, src in enumerate(sources, start=1):
        shutil.copy2(src, OUT / f"source-{i:02d}.jpg")

    print("rembg on 5 frames...")
    frames = [normalize(cutout(p)) for p in sources]

    for i, fr in enumerate(frames, start=1):
        fr.save(OUT / f"frame-{i:02d}.png", optimize=True)

    sheet = Image.new("RGBA", (CANVAS_W * len(frames), CANVAS_H), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, (i * CANVAS_W, 0), fr)
    sheet.save(OUT / "walk-sheet.png", optimize=True)
    save_gif(frames, OUT / "walk-cycle.gif")

    meta = {"frameW": CANVAS_W, "frameH": CANVAS_H, "frames": 5, "ms": FRAME_MS}
    (OUT / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"done -> {OUT / 'walk-cycle.gif'}")


if __name__ == "__main__":
    main()