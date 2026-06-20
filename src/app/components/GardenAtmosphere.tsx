"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "../garden-alive.css";

const ASSETS = {
  meadow: "/garden/atmosphere/meadow-bg.jpg",
  bird: "/garden/atmosphere/bird.png",
  bee: "/garden/atmosphere/bee.png",
  beeFlap: "/garden/atmosphere/bee-flap.png",
  flowerPink: "/garden/atmosphere/flower-pink.png",
  flowerDaisy: "/garden/atmosphere/flower-daisy.png",
} as const;

const BUTTERFLY_SPECIES = [
  {
    name: "monarch",
    open: "/garden/atmosphere/butterflies/monarch-open.png",
    flap: "/garden/atmosphere/butterflies/monarch-flap.png",
  },
  {
    name: "morpho",
    open: "/garden/atmosphere/butterflies/morpho-open.png",
    flap: "/garden/atmosphere/butterflies/morpho-flap.png",
  },
  {
    name: "swallowtail",
    open: "/garden/atmosphere/butterflies/swallowtail-open.png",
    flap: "/garden/atmosphere/butterflies/swallowtail-flap.png",
  },
  {
    name: "white",
    open: "/garden/atmosphere/butterflies/white-open.png",
    flap: "/garden/atmosphere/butterflies/white-flap.png",
  },
  {
    name: "red",
    open: "/garden/atmosphere/butterflies/red-open.png",
    flap: "/garden/atmosphere/butterflies/red-flap.png",
  },
  {
    name: "purple",
    open: "/garden/atmosphere/butterflies/purple-open.png",
    flap: "/garden/atmosphere/butterflies/purple-flap.png",
  },
] as const;

const SPECIES_SHUFFLE = [0, 3, 1, 5, 2, 4, 1, 0];

const showMeadowBackground =
  process.env.NEXT_PUBLIC_GARDEN_BG !== "0";

type BeeFlyer = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  fleeing: number;
  hoverHigh: number;
  targetIdx: number;
  pause: number;
  landing: number;
  angle: number;
};

type ButterflyFlyer = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  species: number;
  size: number;
  targetIdx: number;
  pause: number;
  landing: number;
  frontHold: number;
  angle: number;
  fleeing: number;
};

type ForegroundFlower = {
  id: number;
  src: keyof typeof ASSETS;
  left: string;
  bottom: string;
  scale: number;
  wind: number;
};

const FOREGROUND_FLOWERS: ForegroundFlower[] = [
  { id: 1, src: "flowerDaisy", left: "1%", bottom: "2%", scale: 0.19, wind: 5.2 },
  { id: 4, src: "flowerPink", left: "76%", bottom: "4%", scale: 0.16, wind: 4.8 },
  { id: 5, src: "flowerDaisy", left: "96%", bottom: "2%", scale: 0.2, wind: 5 },
  { id: 8, src: "flowerPink", left: "1%", bottom: "34%", scale: 0.11, wind: 4.7 },
  { id: 11, src: "flowerDaisy", left: "98%", bottom: "10%", scale: 0.15, wind: 5.6 },
  { id: 12, src: "flowerPink", left: "95%", bottom: "20%", scale: 0.13, wind: 4.9 },
  { id: 15, src: "flowerDaisy", left: "96%", bottom: "56%", scale: 0.09, wind: 5.4 },
  { id: 16, src: "flowerPink", left: "10%", bottom: "18%", scale: 0.12, wind: 4.8 },
  { id: 19, src: "flowerDaisy", left: "91%", bottom: "38%", scale: 0.1, wind: 4.7 },
  { id: 20, src: "flowerPink", left: "4%", bottom: "8%", scale: 0.13, wind: 5.1 },
  { id: 23, src: "flowerDaisy", left: "92%", bottom: "26%", scale: 0.11, wind: 4.9 },
  { id: 24, src: "flowerPink", left: "3%", bottom: "50%", scale: 0.09, wind: 5.2 },
];

const REF_VIEWPORT = { w: 1440, h: 900 };
const FLOWER_RENDER_W = 220;
const FLOWER_ASPECT = 1000 / 700;

/** Bloom center aligned to rendered flower sprites (left/bottom/scale). */
function flowerBloomWaypoint(
  f: ForegroundFlower,
  yBiasPx = 0,
): { x: number; y: number } {
  const leftPct = parseFloat(f.left) / 100;
  const bottomPct = parseFloat(f.bottom) / 100;
  const w = FLOWER_RENDER_W * f.scale;
  const h = w * FLOWER_ASPECT;
  const x = (leftPct * REF_VIEWPORT.w + w * 0.5) / REF_VIEWPORT.w;
  const stemBaseTop = (1 - bottomPct) * REF_VIEWPORT.h;
  const bloomCenterTop = stemBaseTop - h * 0.82 + yBiasPx;
  const y = bloomCenterTop / REF_VIEWPORT.h;
  return { x, y };
}

const BEE_FLOWER_WAYPOINTS = FOREGROUND_FLOWERS.map((f) =>
  flowerBloomWaypoint(f, -3),
);
const BUTTERFLY_FLOWER_WAYPOINTS = FOREGROUND_FLOWERS.map((f) =>
  flowerBloomWaypoint(f, 2),
);

const BEE_Y_MIN = 0.34;
const BEE_Y_MAX = 0.94;
const BEE_HOVER_Y_MIN = 0.32;
const BEE_HOVER_Y_MAX = 0.46;
const CRITTER_VIEW_Y_MIN = 0.08;
const CRITTER_VIEW_Y_MAX = 0.94;
const BUTTERFLY_FRONT_HOLD_FRAMES = 160;

const FLYING_BIRDS = [
  { id: 0, top: 7, duration: 17, delay: 0, scale: 0.13, rtl: false },
  { id: 1, top: 13, duration: 23, delay: -7, scale: 0.1, rtl: true },
  { id: 2, top: 19, duration: 20, delay: -13, scale: 0.11, rtl: false },
  { id: 3, top: 10, duration: 28, delay: -19, scale: 0.09, rtl: true },
  { id: 4, top: 16, duration: 25, delay: -4, scale: 0.12, rtl: false },
];

const BUTTERFLY_COUNT = 4;
const BEE_COUNT = 4;

/** Source art faces slightly below horizontal to the right at 0deg. */
const BEE_FLIGHT_ANGLE_OFFSET = -22;
const BEE_REST_ANGLE_OFFSET = -18;

const BEE_APPROACH_RADIUS = 0.34;
const BEE_LANDING_RADIUS = 0.22;
const BEE_LANDING_FRAMES = 240;
const BUTTERFLY_APPROACH_RADIUS = 0.38;
const BUTTERFLY_LANDING_RADIUS = 0.26;
const BUTTERFLY_LANDING_FRAMES = 320;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Lerp factor that tapers off so the final contact is gradual, not a snap. */
function landingLerp(progress: number): number {
  return 0.007 + (1 - easeInOutCubic(progress)) * 0.026;
}

function approachSpeedScale(dist: number, radius: number): number {
  const t = Math.min(1, dist / radius);
  return 0.06 + t ** 2.2 * 0.94;
}

function flightHeadingDeg(
  vx: number,
  vy: number,
  offset = BEE_FLIGHT_ANGLE_OFFSET,
): number | null {
  if (Math.hypot(vx, vy) < 0.00004) return null;
  return (Math.atan2(vy, vx) * 180) / Math.PI + offset;
}

function headingTowardDeg(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  offset = BEE_FLIGHT_ANGLE_OFFSET,
): number {
  return (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI + offset;
}

function lerpAngle(current: number, target: number, t: number): number {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return current + diff * t;
}

function driftTowardZone(
  value: number,
  softMin: number,
  softMax: number,
  rate = 0.024,
): number {
  if (value < softMin) return value + (softMin - value) * rate;
  if (value > softMax) return value + (softMax - value) * rate;
  return value;
}

function clampCritterY(y: number): number {
  if (y < CRITTER_VIEW_Y_MIN) {
    return CRITTER_VIEW_Y_MIN + (y - CRITTER_VIEW_Y_MIN) * 0.35;
  }
  if (y > CRITTER_VIEW_Y_MAX) {
    return CRITTER_VIEW_Y_MAX + (y - CRITTER_VIEW_Y_MAX) * 0.35;
  }
  return y;
}

function pickNearestTarget(
  waypoints: { x: number; y: number }[],
  x: number,
  y: number,
): number {
  let best = 0;
  let bestDist = Infinity;
  waypoints.forEach((w, i) => {
    const d = Math.hypot(w.x - x, w.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

function pickFlowerTarget(current: number): number {
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * BUTTERFLY_FLOWER_WAYPOINTS.length);
  }
  return next;
}

function pickBeeTarget(current: number): number {
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * BEE_FLOWER_WAYPOINTS.length);
  }
  return next;
}

function initBees(count: number): BeeFlyer[] {
  return Array.from({ length: count }, (_, id) => {
    const targetIdx = Math.floor(Math.random() * BEE_FLOWER_WAYPOINTS.length);
    const spot = BEE_FLOWER_WAYPOINTS[targetIdx];
    return {
      id,
      x: spot.x + (Math.random() - 0.5) * 0.04,
      y: spot.y + (Math.random() - 0.5) * 0.03,
      vx: 0,
      vy: 0,
      size: 0.08 + Math.random() * 0.06,
      fleeing: 0,
      hoverHigh: 0,
      targetIdx,
      pause: 140 + Math.floor(Math.random() * 220),
      landing: 0,
      angle: BEE_REST_ANGLE_OFFSET + (id % 4) * 5,
    };
  });
}

function initButterflies(count: number): ButterflyFlyer[] {
  return Array.from({ length: count }, (_, id) => {
    const targetIdx = Math.floor(Math.random() * BUTTERFLY_FLOWER_WAYPOINTS.length);
    const spot = BUTTERFLY_FLOWER_WAYPOINTS[targetIdx];
    return {
      id,
      x: spot.x + (Math.random() - 0.5) * 0.03,
      y: spot.y + (Math.random() - 0.5) * 0.02,
      vx: 0,
      vy: 0,
      species: SPECIES_SHUFFLE[id % SPECIES_SHUFFLE.length],
      size: 0.15 + Math.random() * 0.11,
      targetIdx,
      pause: 300 + Math.floor(Math.random() * 400),
      landing: 0,
      frontHold: 0,
      angle: 6 + (id % 4) * 5,
      fleeing: 0,
    };
  });
}

function stepBees(
  prev: BeeFlyer[],
  mouse: { x: number; y: number },
  dims: { w: number; h: number },
): BeeFlyer[] {
  const { w, h } = dims;
  const mx = mouse.x / w;
  const my = mouse.y / h;
  const t = performance.now() * 0.001;

  return prev.map((b, i) => {
    let { x, y, vx, vy, targetIdx, pause, landing, angle, fleeing, hoverHigh } = b;
    const restAngle = BEE_REST_ANGLE_OFFSET + (i % 5) * 5;

    const mdx = x - mx;
    const mdy = y - my;
    const mouseDist = Math.hypot(mdx, mdy);
    const pxDist = Math.hypot(x * w - mouse.x, y * h - mouse.y);

    if (pxDist < 88) {
      fleeing = 55;
      const push = ((88 - pxDist) / 88) * 0.02;
      vx += (mdx / (mouseDist || 1)) * push;
      vy += (mdy / (mouseDist || 1)) * push;
      pause = 0;
      landing = 0;
      hoverHigh = 0;
    }

    if (fleeing > 0) {
      fleeing -= 1;
      x += vx;
      y += vy;
      vx *= 0.87;
      vy *= 0.87;

      if (fleeing === 0) {
        targetIdx = pickNearestTarget(BEE_FLOWER_WAYPOINTS, x, y);
      }
    } else if (hoverHigh > 0) {
      hoverHigh -= 1;
      x += Math.sin(t * 2.4 + i) * 0.0004;
      y += Math.cos(t * 1.9 + i) * 0.00015;
      vx *= 0.82;
      vy *= 0.82;
      const hoverHeading = flightHeadingDeg(vx, vy) ?? angle;
      angle = lerpAngle(angle, hoverHeading + Math.sin(t * 3.2 + i) * 4, 0.1);
    } else if (landing > 0) {
      const flower = BEE_FLOWER_WAYPOINTS[targetIdx];
      const progress = 1 - landing / BEE_LANDING_FRAMES;
      const lerp = landingLerp(progress);
      const wobble = (1 - progress) * 0.0016;
      const tx = flower.x + Math.sin(t * 1.1 + i) * wobble;
      const ty = flower.y + Math.cos(t * 0.85 + i) * wobble * 0.7;

      x += (tx - x) * lerp;
      y += (ty - y) * lerp;
      vx = (tx - x) * 0.5;
      vy = (ty - y) * 0.5;
      const glideHeading = headingTowardDeg(x, y, tx, ty);
      angle = lerpAngle(
        angle,
        lerpAngle(glideHeading, restAngle, easeInOutCubic(progress)),
        0.1,
      );
      landing -= 1;

      if (landing === 0) {
        pause = 180 + Math.floor(Math.random() * 280);
        vx = 0;
        vy = 0;
      }
    } else if (pause > 0) {
      pause -= 1;
      const flower = BEE_FLOWER_WAYPOINTS[targetIdx];
      const tx = flower.x + Math.sin(t * 1.1 + i) * 0.0004;
      const ty = flower.y + Math.cos(t * 0.85 + i) * 0.0003;
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      vx = 0;
      vy = 0;
      angle += (restAngle - angle) * 0.06;

      if (pause === 0) {
        targetIdx = pickBeeTarget(targetIdx);
        if (Math.random() < 0.0025) {
          hoverHigh = 60 + Math.floor(Math.random() * 40);
          vy = -0.0008;
        }
      }
    } else {
      const target = BEE_FLOWER_WAYPOINTS[targetIdx];
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const slow = approachSpeedScale(dist, BEE_APPROACH_RADIUS);
      const wobble = Math.sin(t * 1.8 + i * 1.1) * 0.00022 * slow;
      const speed = (0.0011 + (i % 4) * 0.0002) * slow;

      vx = (dx / dist) * speed + wobble;
      vy = (dy / dist) * speed + Math.cos(t * 1.5 + i) * 0.00018 * slow;

      x += vx;
      y += vy;

      if (dist < BEE_LANDING_RADIUS) {
        landing = BEE_LANDING_FRAMES;
        vx *= 0.12;
        vy *= 0.12;
      }
    }

    if (fleeing > 0) {
      const fleeHeading = flightHeadingDeg(vx, vy);
      if (fleeHeading !== null) {
        angle = lerpAngle(angle, fleeHeading, 0.18);
      }
    } else if (pause === 0 && landing === 0 && hoverHigh === 0) {
      const flyHeading =
        flightHeadingDeg(vx, vy) ??
        headingTowardDeg(
          x,
          y,
          BEE_FLOWER_WAYPOINTS[targetIdx].x,
          BEE_FLOWER_WAYPOINTS[targetIdx].y,
        );
      angle = lerpAngle(angle, flyHeading, 0.12);
    }

    if (fleeing > 0) {
      x = Math.max(0.03, Math.min(0.97, x));
      y = clampCritterY(y);
    } else if (hoverHigh > 0) {
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(BEE_HOVER_Y_MIN, Math.min(BEE_HOVER_Y_MAX, y));
      if (y > BEE_HOVER_Y_MAX - 0.01) {
        y -= 0.0006;
      }
    } else if (landing > 0 || pause > 0) {
      x = Math.max(0.02, Math.min(0.99, x));
      y = Math.max(0.02, Math.min(0.99, y));
    } else {
      x = Math.max(0.03, Math.min(0.97, x));
      y = clampCritterY(y);
      y = driftTowardZone(y, BEE_Y_MIN, BEE_Y_MAX, 0.02);
    }

    return { ...b, x, y, vx, vy, targetIdx, pause, landing, angle, fleeing, hoverHigh };
  });
}

function stepButterflies(
  prev: ButterflyFlyer[],
  mouse: { x: number; y: number },
  dims: { w: number; h: number },
): ButterflyFlyer[] {
  const { w, h } = dims;
  const mx = mouse.x / w;
  const my = mouse.y / h;
  const t = performance.now() * 0.001;

  return prev.map((b, i) => {
    let { x, y, vx, vy, targetIdx, pause, landing, frontHold, angle, fleeing } = b;
    const restAngle = 4 + (i % 5) * 4;

    const mdx = x - mx;
    const mdy = y - my;
    const mouseDist = Math.hypot(mdx, mdy);

    if (mouseDist < 0.1) {
      fleeing = 90;
      const push = ((0.1 - mouseDist) / 0.1) * 0.012;
      vx += (mdx / (mouseDist || 1)) * push;
      vy += (mdy / (mouseDist || 1)) * push;
      pause = 0;
      landing = 0;
    }

    if (fleeing > 0) {
      fleeing -= 1;
      x += vx;
      y += vy;
      vx *= 0.9;
      vy *= 0.9;

      if (fleeing === 0) {
        targetIdx = pickNearestTarget(BUTTERFLY_FLOWER_WAYPOINTS, x, y);
        frontHold = BUTTERFLY_FRONT_HOLD_FRAMES;
      }
    } else if (landing > 0) {
      const flower = BUTTERFLY_FLOWER_WAYPOINTS[targetIdx];
      const progress = 1 - landing / BUTTERFLY_LANDING_FRAMES;
      const lerp = landingLerp(progress);
      const wobble = (1 - progress) * 0.0018;
      const tx = flower.x + Math.sin(t * 0.95 + i) * wobble;
      const ty = flower.y + Math.cos(t * 0.75 + i) * wobble * 0.65;

      x += (tx - x) * lerp;
      y += (ty - y) * lerp;
      vx *= 0.84;
      vy *= 0.84;
      angle += (restAngle - angle) * (0.015 + (1 - progress) * 0.025);
      landing -= 1;

      if (landing === 0) {
        pause = 450 + Math.floor(Math.random() * 400);
        vx = 0;
        vy = 0;
      }
    } else if (pause > 0) {
      pause -= 1;
      const flower = BUTTERFLY_FLOWER_WAYPOINTS[targetIdx];
      const tx = flower.x + Math.sin(t * 1.2 + i) * 0.0005;
      const ty = flower.y + Math.cos(t * 0.9 + i) * 0.00035;
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      vx = 0;
      vy = 0;
      angle += (restAngle - angle) * 0.05;

      if (pause === 0) {
        targetIdx = pickFlowerTarget(targetIdx);
      }
    } else {
      const target = BUTTERFLY_FLOWER_WAYPOINTS[targetIdx];
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const slow = approachSpeedScale(dist, BUTTERFLY_APPROACH_RADIUS);
      const wobble = Math.sin(t * 0.8 + i * 1.3) * 0.00016 * slow;
      const speed = (0.0006 + (i % 5) * 0.00008) * slow;

      vx = (dx / dist) * speed + wobble;
      vy = (dy / dist) * speed + Math.cos(t * 0.7 + i) * 0.00014 * slow;

      x += vx;
      y += vy;

      if (dist < BUTTERFLY_LANDING_RADIUS) {
        landing = BUTTERFLY_LANDING_FRAMES;
        vx *= 0.1;
        vy *= 0.1;
      }
    }

    if (fleeing > 0 || (pause === 0 && landing === 0 && (vx !== 0 || vy !== 0))) {
      angle = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
    }

    if (frontHold > 0 && fleeing === 0) {
      frontHold -= 1;
    }

    if (fleeing > 0) {
      x = Math.max(0.03, Math.min(0.97, x));
      y = clampCritterY(y);
    } else if (landing > 0 || pause > 0) {
      x = Math.max(0.02, Math.min(0.99, x));
      y = Math.max(0.02, Math.min(0.99, y));
    } else {
      x = Math.max(0.03, Math.min(0.97, x));
      y = clampCritterY(y);
      y = driftTowardZone(y, 0.38, 0.97, 0.018);
    }

    return { ...b, x, y, vx, vy, targetIdx, pause, landing, frontHold, angle, fleeing };
  });
}

export function GardenAtmosphere() {
  const beesRef = useRef<BeeFlyer[]>([]);
  const butterfliesRef = useRef<ButterflyFlyer[]>([]);
  const beeEls = useRef<(HTMLDivElement | null)[]>([]);
  const butterflyBgEls = useRef<(HTMLDivElement | null)[]>([]);
  const butterflyFrontEls = useRef<(HTMLDivElement | null)[]>([]);

  const [crittersReady, setCrittersReady] = useState(false);
  const [windGust, setWindGust] = useState(false);

  const mouse = useRef({ x: -9999, y: -9999 });
  const dims = useRef({ w: 1, h: 1 });
  const raf = useRef(0);

  const paintCritters = useCallback(() => {
    beesRef.current.forEach((b, i) => {
      const el = beeEls.current[i];
      if (!el) return;
      const fleeing = b.fleeing > 0;
      const settling = b.landing > 0;
      const onFlower = b.pause > 0 && !settling && !fleeing && b.hoverHigh === 0;
      const flying = !fleeing && !onFlower && b.hoverHigh === 0;
      el.style.left = `${b.x * 100}%`;
      el.style.top = `${b.y * 100}%`;
      el.style.transform = `translate(-50%, -50%) rotate(${b.angle}deg)`;
      el.classList.toggle("garden-bee--flee", fleeing);
      el.classList.toggle("garden-bee--hover-high", b.hoverHigh > 0);
      el.classList.toggle("garden-bee--landing", settling);
      el.classList.toggle("garden-bee--on-flower", onFlower);
      el.classList.toggle("garden-bee--flying", flying);
    });

    butterfliesRef.current.forEach((b, i) => {
      const bg = butterflyBgEls.current[i];
      const front = butterflyFrontEls.current[i];
      const fleeing = b.fleeing > 0;
      const settling = b.landing > 0;
      const onFrontLayer = fleeing || b.frontHold > 0;
      const feeding = b.pause > 0 && !settling && !fleeing;
      const flying = !feeding && !fleeing;

      const apply = (el: HTMLDivElement | null, layer: "bg" | "front") => {
        if (!el) return;
        const show = onFrontLayer ? layer === "front" : layer === "bg";
        el.style.display = show ? "block" : "none";
        if (!show) return;
        el.style.left = `${b.x * 100}%`;
        el.style.top = `${b.y * 100}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${b.angle}deg)`;
        el.classList.toggle("garden-butterfly-flyer--feeding", feeding);
        el.classList.toggle("garden-butterfly-flyer--landing", settling);
        el.classList.toggle("garden-butterfly-flyer--flee", fleeing);
        el.classList.toggle("garden-butterfly-flyer--flying", flying);
      };

      apply(bg, "bg");
      apply(front, "front");
    });
  }, []);

  useEffect(() => {
    beesRef.current = initBees(BEE_COUNT);
    butterfliesRef.current = initButterflies(BUTTERFLY_COUNT);
    setCrittersReady(true);
  }, []);

  useEffect(() => {
    if (!crittersReady) return;

    document.documentElement.classList.add("garden-alive");

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onResize = () => {
      dims.current = { w: window.innerWidth, h: window.innerHeight };
    };

    onResize();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    const loop = () => {
      beesRef.current = stepBees(beesRef.current, mouse.current, dims.current);
      butterfliesRef.current = stepButterflies(
        butterfliesRef.current,
        mouse.current,
        dims.current,
      );
      paintCritters();
      raf.current = requestAnimationFrame(loop);
    };

    paintCritters();
    raf.current = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("garden-alive");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf.current);
    };
  }, [crittersReady, paintCritters]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let gustTimer: ReturnType<typeof setTimeout>;
    const gustLoop = () => {
      const wait = 14000 + Math.random() * 10000;
      gustTimer = setTimeout(() => {
        setWindGust(true);
        setTimeout(() => setWindGust(false), 2200);
        gustLoop();
      }, wait);
    };
    gustLoop();
    return () => clearTimeout(gustTimer);
  }, []);

  return (
    <>
      <div
        className={`garden-atmo${windGust ? " garden-atmo--gust" : ""}${showMeadowBackground ? "" : " garden-atmo--no-bg"}`}
        aria-hidden="true"
      >
        {showMeadowBackground ? (
          <>
            <div className="garden-atmo__photo">
              <Image
                src={ASSETS.meadow}
                alt=""
                fill
                priority
                sizes="100vw"
                className="garden-atmo__photo-img"
              />
            </div>
            <div className="garden-atmo__haze" />
          </>
        ) : null}

        {FLYING_BIRDS.map((b) => (
          <div
            key={b.id}
            className={`garden-bird-flyer${b.rtl ? " garden-bird-flyer--rtl" : ""}`}
            style={{
              ["--bird-top" as string]: `${b.top}%`,
              ["--bird-scale" as string]: b.scale,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          >
            <Image
              src={ASSETS.bird}
              alt=""
              width={667}
              height={787}
              className="garden-bird-flyer__img"
              draggable={false}
            />
          </div>
        ))}

        {FOREGROUND_FLOWERS.map((f) => (
          <div
            key={f.id}
            className="garden-flower-photo"
            style={{
              left: f.left,
              bottom: f.bottom,
              ["--flower-scale" as string]: f.scale,
              animationDuration: `${f.wind}s`,
            }}
            tabIndex={0}
          >
            <Image
              src={ASSETS[f.src]}
              alt=""
              width={700}
              height={1000}
              className="garden-flower-photo__img"
              draggable={false}
            />
          </div>
        ))}

        {crittersReady && (
          <div className="garden-butterflies-bg" aria-hidden="true">
            {butterfliesRef.current.map((b, i) => {
              const species = BUTTERFLY_SPECIES[b.species];
              return (
                <div
                  key={`bf-bg-${b.id}`}
                  ref={(el) => {
                    butterflyBgEls.current[i] = el;
                  }}
                  className="garden-butterfly-flyer"
                  style={{ ["--critter-scale" as string]: String(b.size) }}
                  title={`${species.name} butterfly`}
                >
                  <div className="garden-butterfly-sprite">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={species.open}
                      alt=""
                      className="garden-butterfly-sprite__open"
                      draggable={false}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={species.flap}
                      alt=""
                      className="garden-butterfly-sprite__flap"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {crittersReady && (
        <>
          <div className="garden-butterflies-front" aria-hidden="true">
            {butterfliesRef.current.map((b, i) => {
              const species = BUTTERFLY_SPECIES[b.species];
              return (
                <div
                  key={`bf-front-${b.id}`}
                  ref={(el) => {
                    butterflyFrontEls.current[i] = el;
                  }}
                  className="garden-butterfly-flyer"
                  style={{ ["--critter-scale" as string]: String(b.size), display: "none" }}
                  title={`${species.name} butterfly`}
                >
                  <div className="garden-butterfly-sprite">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={species.open}
                      alt=""
                      className="garden-butterfly-sprite__open"
                      draggable={false}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={species.flap}
                      alt=""
                      className="garden-butterfly-sprite__flap"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="garden-critters-layer" aria-hidden="true">
            {beesRef.current.map((b, i) => (
              <div
                key={`bee-${b.id}`}
                ref={(el) => {
                  beeEls.current[i] = el;
                }}
                className="garden-critter garden-bee"
                style={{ ["--critter-scale" as string]: String(b.size) }}
                title="A busy bee"
              >
                <div className="garden-bee-sprite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ASSETS.bee}
                    alt=""
                    className="garden-bee-sprite__open"
                    draggable={false}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ASSETS.beeFlap}
                    alt=""
                    className="garden-bee-sprite__flap"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </>
  );
}