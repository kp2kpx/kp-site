"""
High-quality pixel art for the Planted by KP footer.
Original KP garden art. Chester-inspired hover technique only.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "planted"

TRANSPARENT = (0, 0, 0, 0)
INK = (34, 30, 26, 255)
INK_SOFT = (52, 46, 40, 255)
LEAF_HI = (186, 220, 132, 255)
LEAF_MD = (126, 154, 86, 255)
LEAF_LO = (82, 104, 58, 255)
LEAF_VEIN = (68, 88, 48, 255)
STEM = (74, 96, 52, 255)
SHIRT = (198, 118, 72, 255)
SHIRT_SH = (158, 88, 52, 255)
SHIRT_HI = (228, 148, 98, 255)
PANTS = (108, 78, 56, 255)
PANTS_SH = (78, 56, 40, 255)
SKIN = (244, 210, 176, 255)
SKIN_SH = (210, 168, 132, 255)
HAIR = (30, 26, 22, 255)
SHOE = (62, 44, 32, 255)
FROG_G = (88, 168, 92, 255)
FROG_G_SH = (58, 118, 62, 255)
FROG_G_HI = (140, 210, 132, 255)
FROG_Y = (228, 188, 78, 255)
FROG_Y_SH = (178, 138, 48, 255)
GEM_HI = (168, 228, 248, 255)
GEM_MD = (98, 178, 210, 255)
GEM_LO = (58, 118, 148, 255)

WALK_W, WALK_H = 161, 86
LEAVES_SIZE = 96
FRAME_COUNT = 6
S = 2.35  # global scale so sprites fill the frame like Chester's


class Canvas:
    def __init__(self, w: int, h: int) -> None:
        self.w, self.h = w, h
        self.buf = [TRANSPARENT] * (w * h)

    def idx(self, x: int, y: int) -> int:
        return y * self.w + x

    def get(self, x: int, y: int):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.buf[self.idx(x, y)]
        return TRANSPARENT

    def set(self, x: int, y: int, c) -> None:
        xi, yi = int(round(x)), int(round(y))
        if 0 <= xi < self.w and 0 <= yi < self.h and c[3] > 0:
            self.buf[self.idx(xi, yi)] = c

    def image(self) -> Image.Image:
        return Image.frombytes("RGBA", (self.w, self.h), bytes(c for px in self.buf for c in px))

    def fill_ellipse(self, cx: float, cy: float, rx: float, ry: float, c) -> None:
        rx, ry = max(rx, 0.5), max(ry, 0.5)
        for y in range(int(cy - ry - 2), int(cy + ry + 3)):
            for x in range(int(cx - rx - 2), int(cx + rx + 3)):
                nx, ny = (x - cx) / rx, (y - cy) / ry
                if nx * nx + ny * ny <= 1.0:
                    self.set(x, y, c)

    def line(self, x0: float, y0: float, x1: float, y1: float, c) -> None:
        dist = math.hypot(x1 - x0, y1 - y0)
        steps = max(int(dist * 2), 1)
        for i in range(steps + 1):
            t = i / steps
            self.set(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, c)

    def outline_region(self, ink=INK) -> None:
        src = list(self.buf)
        for y in range(self.h):
            for x in range(self.w):
                if src[self.idx(x, y)][3] == 0:
                    continue
                edge = False
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if not (0 <= nx < self.w and 0 <= ny < self.h) or src[self.idx(nx, ny)][3] == 0:
                        edge = True
                        break
                if edge:
                    self.set(x, y, ink)


def rotate_point(x: float, y: float, cx: float, cy: float, deg: float) -> tuple[float, float]:
    r = math.radians(deg)
    s, co = math.sin(r), math.cos(r)
    dx, dy = x - cx, y - cy
    return cx + dx * co - dy * s, cy + dx * s + dy * co


def draw_leaf_shape(cv: Canvas, cx: float, cy: float, length: float, width: float, angle: float) -> None:
    tip_x, tip_y = rotate_point(cx + length * 0.52, cy, cx, cy, angle)
    tail_x, tail_y = rotate_point(cx - length * 0.42, cy, cx, cy, angle)

    steps = max(int(length * 1.8), 8)
    for i in range(steps):
        t = i / max(steps - 1, 1)
        bx = cx + (tip_x - cx) * t * 0.95 + (tail_x - cx) * (1 - t) * 0.15
        by = cy + (tip_y - cy) * t * 0.95 + (tail_y - cy) * (1 - t) * 0.15
        taper = math.sin(t * math.pi)
        w = width * (0.25 + 0.75 * taper)
        cv.fill_ellipse(bx, by, max(1.0, w * 0.55), max(0.7, w * 0.34), LEAF_MD if t < 0.55 else LEAF_LO)
        if taper > 0.42:
            cv.fill_ellipse(bx - 0.5, by - 0.6, max(0.7, w * 0.32), max(0.45, w * 0.18), LEAF_HI)

    cv.line(cx, cy, tip_x, tip_y, LEAF_VEIN)
    for sign in (-1, 1):
        for frac in (0.25, 0.42, 0.58):
            vx, vy = rotate_point(cx + length * (frac - 0.2), cy, cx, cy, angle)
            ex, ey = rotate_point(vx + sign * width * 0.42, vy - width * 0.08, vx, vy, angle + sign * 28)
            cv.line(vx, vy, ex, ey, LEAF_VEIN)

    cv.fill_ellipse(tail_x, tail_y, 1.3, 1.3, STEM)
    for i in range(5):
        sx, sy = rotate_point(tail_x - i * 1.0, tail_y + 0.3, tail_x, tail_y, angle)
        cv.set(sx, sy, STEM)


def draw_leaf_icon() -> Image.Image:
    cv = Canvas(LEAVES_SIZE, LEAVES_SIZE)
    # two natural leaves + shared stem, Chester-style sprig
    draw_leaf_shape(cv, 30, 64, 38, 16, -14)
    draw_leaf_shape(cv, 58, 38, 32, 13, 20)
    cv.line(34, 66, 52, 52, STEM)
    cv.line(52, 52, 56, 40, STEM)
    cv.outline_region()
    # re-paint interiors so outline doesn't eat highlights
    paint = Canvas(LEAVES_SIZE, LEAVES_SIZE)
    draw_leaf_shape(paint, 30, 64, 38, 16, -14)
    draw_leaf_shape(paint, 58, 38, 32, 13, 20)
    paint.line(34, 66, 52, 52, STEM)
    paint.line(52, 52, 56, 40, STEM)
    for y in range(LEAVES_SIZE):
        for x in range(LEAVES_SIZE):
            if paint.get(x, y)[3]:
                cv.buf[cv.idx(x, y)] = paint.get(x, y)
    cv.outline_region()
    return cv.image()


def stamp_outline(cv: Canvas, layer: Canvas, ox: int, oy: int) -> None:
    layer.outline_region()
    for y in range(layer.h):
        for x in range(layer.w):
            c = layer.get(x, y)
            if c[3]:
                cv.set(ox + x, oy + y, c)


def draw_frog_layer(x: int, y: int, big: bool) -> Canvas:
    cv = Canvas(26 if big else 12, 20 if big else 10)
    if big:
        cv.fill_ellipse(10, 14, 9, 7, FROG_G)
        cv.fill_ellipse(10, 16, 7, 4, FROG_G_SH)
        cv.fill_ellipse(6, 7, 3, 3, FROG_G_HI)
        cv.fill_ellipse(14, 7, 3, 3, FROG_G_HI)
        cv.set(6, 7, INK)
        cv.set(14, 7, INK)
        cv.set(5, 18, INK)
        cv.set(15, 18, INK)
    else:
        cv.fill_ellipse(5, 7, 4, 3.5, FROG_G)
        cv.fill_ellipse(3, 3, 1.5, 1.5, FROG_G_HI)
        cv.fill_ellipse(7, 3, 1.5, 1.5, FROG_G_HI)
        cv.set(3, 3, INK)
        cv.set(7, 3, INK)
    return cv


def draw_gem_layer(x: int, y: int) -> Canvas:
    cv = Canvas(8, 8)
    pts = [(3, 0), (7, 2), (5, 7), (1, 7), (0, 2)]
    for i in range(len(pts)):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % len(pts)]
        cv.line(x0, y0, x1, y1, GEM_LO)
    cv.fill_ellipse(3.5, 3.5, 2, 2, GEM_MD)
    cv.set(3, 2, GEM_HI)
    cv.set(5, 4, GEM_HI)
    return cv


def draw_boy_layer(phase: int) -> Canvas:
    cv = Canvas(34, 52)
    bob = -1.5 if phase % 2 else 0
    fwd = phase % 2 == 0

    # legs / shoes
    if fwd:
        cv.fill_ellipse(12, 42 + bob, 4, 7, PANTS)
        cv.fill_ellipse(21, 45 + bob, 3.5, 5, PANTS_SH)
        cv.fill_ellipse(12, 49 + bob, 4.5, 2.5, SHOE)
        cv.fill_ellipse(21, 50 + bob, 4, 2.2, SHOE)
    else:
        cv.fill_ellipse(17, 45 + bob, 3.5, 5, PANTS_SH)
        cv.fill_ellipse(9, 42 + bob, 4, 7, PANTS)
        cv.fill_ellipse(17, 50 + bob, 4, 2.2, SHOE)
        cv.fill_ellipse(9, 49 + bob, 4.5, 2.5, SHOE)

    cv.fill_ellipse(16, 28 + bob, 10, 12, SHIRT)
    cv.fill_ellipse(14, 26 + bob, 7, 5, SHIRT_HI)
    cv.fill_ellipse(17, 32 + bob, 6, 6, SHIRT_SH)

    arm = -1.5 if fwd else 1
    cv.fill_ellipse(6, 28 + bob + arm, 3.5, 3.5, SKIN)
    cv.fill_ellipse(26, 29 + bob - arm, 3, 3, SKIN)

    cv.fill_ellipse(16, 14 + bob, 9, 9, SKIN)
    cv.fill_ellipse(14, 16 + bob, 3, 2, SKIN_SH)
    cv.fill_ellipse(12, 11 + bob, 2, 2.5, HAIR)
    cv.fill_ellipse(20, 11 + bob, 2, 2.5, HAIR)
    cv.fill_ellipse(16, 8 + bob, 8, 4, HAIR)
    cv.set(12, 16 + bob, INK)
    cv.set(20, 16 + bob, INK)
    cv.set(16, 19 + bob, INK_SOFT)
    draw_leaf_shape(cv, 18, 5 + bob, 7, 3, 12)

    return cv


def draw_branch_on(cv: Canvas, ox: float, oy: float, phase: int) -> None:
    sway = (phase % 3) - 1
    draw_leaf_shape(cv, ox - 34, oy + sway, 36, 15, -6)
    draw_leaf_shape(cv, ox - 10, oy - 8 + sway, 14, 6, 16)
    for i in range(52):
        cv.set(ox - 36 + i, oy + 1 + (sway if i > 20 else 0), STEM)


def draw_walk_frame(phase: int) -> Image.Image:
    cv = Canvas(WALK_W, WALK_H)
    shift = phase * 5
    boy_x = 58 + shift
    boy_y = 18
    stem_y = 56

    # platform leaf + frog
    plat = Canvas(44, 24)
    draw_leaf_shape(plat, 10, 14, 28, 12, -4)
    stamp_outline(cv, plat, 4 + shift, 52)
    stamp_outline(cv, draw_frog_layer(0, 0, True), 24 + shift, 54)

    # long stem through boy's hands
    draw_branch_on(cv, boy_x + 8, stem_y, phase)

    boy = draw_boy_layer(phase)
    stamp_outline(cv, boy, boy_x, boy_y)

    # hands gripping the stem
    grip_y = stem_y
    cv.fill_ellipse(boy_x + 2, grip_y, 2.5, 2.5, SKIN)
    cv.fill_ellipse(boy_x + 18, grip_y, 2.5, 2.5, SKIN)
    cv.set(boy_x + 2, grip_y, INK)
    cv.set(boy_x + 18, grip_y, INK)

    hop = -1.5 if (phase + 1) % 2 else 0
    stamp_outline(cv, draw_frog_layer(0, 0, False), 96 + shift, 58 + hop)
    stamp_outline(cv, draw_gem_layer(0, 0), 108 + shift, 54 + (1 if phase % 2 else 0))

    toad = Canvas(12, 10)
    toad.fill_ellipse(5, 7, 4, 3.5, FROG_Y)
    toad.fill_ellipse(3, 3, 1.5, 1.5, FROG_Y)
    toad.set(3, 3, INK)
    toad.set(7, 3, INK)
    stamp_outline(cv, toad, 118 + shift, 58 - hop)

    accent = Canvas(10, 10)
    draw_leaf_shape(accent, 5, 5, 6, 2.5, 30)
    stamp_outline(cv, accent, 128 + shift, 48)

    return cv.image()


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    frames_dir = ROOT / "frames"
    frames_dir.mkdir(exist_ok=True)

    leaves = draw_leaf_icon()
    leaves.save(ROOT / "leaves.png", optimize=True)

    frames: list[Image.Image] = []
    for i in range(FRAME_COUNT):
        frame = draw_walk_frame(i)
        frame.save(frames_dir / f"walk-{i:02d}.png", optimize=True)
        frames.append(frame)

    sheet = Image.new("RGBA", (WALK_W * FRAME_COUNT, WALK_H), TRANSPARENT)
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i * WALK_W, 0))
    sheet.save(ROOT / "walk-sheet.png", optimize=True)

    frames[0].save(
        ROOT / "walk.gif",
        save_all=True,
        append_images=frames[1:],
        duration=130,
        loop=0,
        disposal=2,
        optimize=False,
    )

    bboxes = [f.getbbox() for f in frames]
    print(f"wrote leaves.png, walk-sheet.png, walk.gif ({FRAME_COUNT} frames)")
    print("frame bboxes:", bboxes)


if __name__ == "__main__":
    main()