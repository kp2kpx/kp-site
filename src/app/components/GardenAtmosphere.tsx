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
  { id: 2, src: "flowerPink", left: "24%", bottom: "3%", scale: 0.15, wind: 4.6 },
  { id: 3, src: "flowerDaisy", left: "50%", bottom: "1%", scale: 0.17, wind: 5.5 },
  { id: 4, src: "flowerPink", left: "76%", bottom: "4%", scale: 0.16, wind: 4.8 },
  { id: 5, src: "flowerDaisy", left: "96%", bottom: "2%", scale: 0.2, wind: 5 },
  { id: 6, src: "flowerPink", left: "0%", bottom: "12%", scale: 0.14, wind: 4.4 },
  { id: 7, src: "flowerDaisy", left: "3%", bottom: "22%", scale: 0.12, wind: 5.3 },
  { id: 8, src: "flowerPink", left: "1%", bottom: "34%", scale: 0.11, wind: 4.7 },
  { id: 9, src: "flowerDaisy", left: "5%", bottom: "46%", scale: 0.1, wind: 5.1 },
  { id: 10, src: "flowerPink", left: "2%", bottom: "58%", scale: 0.09, wind: 4.5 },
  { id: 11, src: "flowerDaisy", left: "98%", bottom: "10%", scale: 0.15, wind: 5.6 },
  { id: 12, src: "flowerPink", left: "95%", bottom: "20%", scale: 0.13, wind: 4.9 },
  { id: 13, src: "flowerDaisy", left: "97%", bottom: "32%", scale: 0.11, wind: 5.2 },
  { id: 14, src: "flowerPink", left: "93%", bottom: "44%", scale: 0.1, wind: 4.6 },
  { id: 15, src: "flowerDaisy", left: "96%", bottom: "56%", scale: 0.09, wind: 5.4 },
  { id: 16, src: "flowerPink", left: "10%", bottom: "18%", scale: 0.12, wind: 4.8 },
  { id: 17, src: "flowerDaisy", left: "88%", bottom: "16%", scale: 0.12, wind: 5 },
  { id: 18, src: "flowerPink", left: "7%", bottom: "40%", scale: 0.1, wind: 5.3 },
  { id: 19, src: "flowerDaisy", left: "91%", bottom: "38%", scale: 0.1, wind: 4.7 },
  { id: 20, src: "flowerPink", left: "4%", bottom: "8%", scale: 0.13, wind: 5.1 },
  { id: 21, src: "flowerDaisy", left: "94%", bottom: "6%", scale: 0.14, wind: 4.5 },
  { id: 22, src: "flowerPink", left: "6%", bottom: "28%", scale: 0.11, wind: 5.5 },
  { id: 23, src: "flowerDaisy", left: "92%", bottom: "26%", scale: 0.11, wind: 4.9 },
  { id: 24, src: "flowerPink", left: "3%", bottom: "50%", scale: 0.09, wind: 5.2 },
];

const MEADOW_FLOWER_SPOTS = [
  { x: 0.1, y: 0.8 },
  { x: 0.22, y: 0.76 },
  { x: 0.34, y: 0.78 },
  { x: 0.48, y: 0.74 },
  { x: 0.6, y: 0.77 },
  { x: 0.74, y: 0.75 },
  { x: 0.86, y: 0.79 },
  { x: 0.42, y: 0.58 },
  { x: 0.58, y: 0.52 },
  { x: 0.24, y: 0.55 },
  { x: 0.7, y: 0.56 },
  { x: 0.16, y: 0.64 },
  { x: 0.52, y: 0.42 },
  { x: 0.78, y: 0.44 },
  { x: 0.32, y: 0.46 },
];

function buildFlowerWaypoints(): { x: number; y: number }[] {
  const foreground = FOREGROUND_FLOWERS.map((f) => ({
    x: parseFloat(f.left) / 100 + 0.015,
    y: 1 - parseFloat(f.bottom) / 100 - 0.1,
  }));
  return [...foreground, ...MEADOW_FLOWER_SPOTS];
}

const FLOWER_WAYPOINTS = buildFlowerWaypoints();
const BACKGROUND_FLOWER_WAYPOINTS = FLOWER_WAYPOINTS.filter((w) => w.y >= 0.48);

const BEE_FLOWER_WAYPOINTS = [
  ...FOREGROUND_FLOWERS.map((f) => ({
    x: parseFloat(f.left) / 100 + 0.018,
    y: 1 - parseFloat(f.bottom) / 100 - 0.055,
  })),
  ...MEADOW_FLOWER_SPOTS.filter((w) => w.y >= 0.52),
];

const BEE_Y_MIN = 0.34;
const BEE_Y_MAX = 0.94;
const BEE_HOVER_Y_MIN = 0.32;
const BEE_HOVER_Y_MAX = 0.46;

const FLYING_BIRDS = [
  { id: 0, top: 7, duration: 17, delay: 0, scale: 0.13, rtl: false },
  { id: 1, top: 13, duration: 23, delay: -7, scale: 0.1, rtl: true },
  { id: 2, top: 19, duration: 20, delay: -13, scale: 0.11, rtl: false },
  { id: 3, top: 10, duration: 28, delay: -19, scale: 0.09, rtl: true },
  { id: 4, top: 16, duration: 25, delay: -4, scale: 0.12, rtl: false },
];

const BUTTERFLY_COUNT = 8;
const BEE_COUNT = 9;

function pickFlowerTarget(current: number): number {
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * BACKGROUND_FLOWER_WAYPOINTS.length);
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
      angle: 16 + (id % 4) * 8,
    };
  });
}

function initButterflies(count: number): ButterflyFlyer[] {
  return Array.from({ length: count }, (_, id) => {
    const targetIdx = Math.floor(Math.random() * BACKGROUND_FLOWER_WAYPOINTS.length);
    const spot = BACKGROUND_FLOWER_WAYPOINTS[targetIdx];
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
    let { x, y, vx, vy, targetIdx, pause, angle, fleeing, hoverHigh } = b;

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
      hoverHigh = 0;
    }

    if (fleeing > 0) {
      fleeing -= 1;
      x += vx;
      y += vy;
      vx *= 0.87;
      vy *= 0.87;

      if (fleeing === 0) {
        targetIdx = pickBeeTarget(targetIdx);
        pause = 35;
      }
    } else if (hoverHigh > 0) {
      hoverHigh -= 1;
      x += Math.sin(t * 2.4 + i) * 0.0004;
      y += Math.cos(t * 1.9 + i) * 0.00015;
      vx *= 0.82;
      vy *= 0.82;
      angle = Math.sin(t * 3.2 + i) * 10;
    } else if (pause > 0) {
      pause -= 1;
      const flower = BEE_FLOWER_WAYPOINTS[targetIdx];
      x += (flower.x - x) * 0.12;
      y += (flower.y - y) * 0.12;
      x += Math.sin(t * 1.1 + i) * 0.00005;
      y += Math.cos(t * 0.85 + i) * 0.00003;
      vx = 0;
      vy = 0;
      angle = 14 + (i % 5) * 7;

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
      const wobble = Math.sin(t * 1.8 + i * 1.1) * 0.00028;
      const speed = 0.0011 + (i % 4) * 0.0002;

      vx = (dx / dist) * speed + wobble;
      vy = (dy / dist) * speed + Math.cos(t * 1.5 + i) * 0.00024;

      x += vx;
      y += vy;

      if (dist < 0.028) {
        x = target.x + (Math.random() - 0.5) * 0.008;
        y = target.y + (Math.random() - 0.5) * 0.006;
        pause = 180 + Math.floor(Math.random() * 280);
        vx = 0;
        vy = 0;
      }
    }

    if (fleeing > 0 || (pause === 0 && hoverHigh === 0)) {
      angle = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
    }

    if (fleeing > 0) {
      x = Math.max(0.03, Math.min(0.97, x));
      y = Math.max(0.04, Math.min(0.96, y));
    } else if (hoverHigh > 0) {
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(BEE_HOVER_Y_MIN, Math.min(BEE_HOVER_Y_MAX, y));
      if (y > BEE_HOVER_Y_MAX - 0.01) {
        y -= 0.0006;
      }
    } else {
      x = Math.max(0.03, Math.min(0.97, x));
      y = Math.max(BEE_Y_MIN, Math.min(BEE_Y_MAX, y));
    }

    return { ...b, x, y, vx, vy, targetIdx, pause, angle, fleeing, hoverHigh };
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
    let { x, y, vx, vy, targetIdx, pause, angle, fleeing } = b;

    const mdx = x - mx;
    const mdy = y - my;
    const mouseDist = Math.hypot(mdx, mdy);

    if (mouseDist < 0.1) {
      fleeing = 90;
      const push = ((0.1 - mouseDist) / 0.1) * 0.012;
      vx += (mdx / (mouseDist || 1)) * push;
      vy += (mdy / (mouseDist || 1)) * push;
      pause = 0;
    }

    if (fleeing > 0) {
      fleeing -= 1;
      x += vx;
      y += vy;
      vx *= 0.9;
      vy *= 0.9;

      if (fleeing === 0) {
        targetIdx = pickFlowerTarget(targetIdx);
      }
    } else if (pause > 0) {
      pause -= 1;
      x += Math.sin(t * 1.2 + i) * 0.00015;
      y += Math.cos(t * 0.9 + i) * 0.0001;
      vx *= 0.8;
      vy *= 0.8;
      angle = 4 + (i % 5) * 4;
    } else {
      const target = BACKGROUND_FLOWER_WAYPOINTS[targetIdx];
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      const wobble = Math.sin(t * 0.8 + i * 1.3) * 0.0002;
      const speed = 0.0006 + (i % 5) * 0.00008;

      vx = (dx / dist) * speed + wobble;
      vy = (dy / dist) * speed + Math.cos(t * 0.7 + i) * 0.00018;

      x += vx;
      y += vy;

      if (dist < 0.028) {
        pause = 450 + Math.floor(Math.random() * 400);
        targetIdx = pickFlowerTarget(targetIdx);
        vx = 0;
        vy = 0;
      }
    }

    if (fleeing > 0 || (pause === 0 && (vx !== 0 || vy !== 0))) {
      angle = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
    }

    if (fleeing > 0) {
      x = Math.max(0.03, Math.min(0.97, x));
      y = Math.max(0.06, Math.min(0.94, y));
    } else {
      x = Math.max(0.03, Math.min(0.97, x));
      y = Math.max(0.48, Math.min(0.94, y));
    }

    return { ...b, x, y, vx, vy, targetIdx, pause, angle, fleeing };
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
      const onFlower = b.pause > 0 && !fleeing && b.hoverHigh === 0;
      const flying = !fleeing && !onFlower && b.hoverHigh === 0;
      el.style.left = `${b.x * 100}%`;
      el.style.top = `${b.y * 100}%`;
      el.style.transform = `translate(-50%, -50%) rotate(${b.angle}deg)`;
      el.classList.toggle("garden-bee--flee", fleeing);
      el.classList.toggle("garden-bee--hover-high", b.hoverHigh > 0);
      el.classList.toggle("garden-bee--on-flower", onFlower);
      el.classList.toggle("garden-bee--flying", flying);
    });

    butterfliesRef.current.forEach((b, i) => {
      const bg = butterflyBgEls.current[i];
      const front = butterflyFrontEls.current[i];
      const fleeing = b.fleeing > 0;
      const feeding = b.pause > 0 && !fleeing;
      const flying = !feeding && !fleeing;

      const apply = (el: HTMLDivElement | null, layer: "bg" | "front") => {
        if (!el) return;
        const show = fleeing ? layer === "front" : layer === "bg";
        el.style.display = show ? "block" : "none";
        if (!show) return;
        el.style.left = `${b.x * 100}%`;
        el.style.top = `${b.y * 100}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${b.angle}deg)`;
        el.classList.toggle("garden-butterfly-flyer--feeding", feeding);
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
        className={`garden-atmo${windGust ? " garden-atmo--gust" : ""}`}
        aria-hidden="true"
      >
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