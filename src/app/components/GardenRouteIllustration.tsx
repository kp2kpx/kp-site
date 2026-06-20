"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  getGardenIllustrationForPath,
  showMeadowBackground,
} from "@/lib/garden-illustrations";
import "../garden-alive.css";

/**
 * Site-wide paper-garden backdrop when meadow photo is off.
 * Picks illustration from the current route. Critters stay on home only.
 */
export function GardenRouteIllustration() {
  const pathname = usePathname();
  const src = getGardenIllustrationForPath(pathname);

  useEffect(() => {
    if (showMeadowBackground) return;

    document.documentElement.classList.add("garden-alive", "garden-alive--no-meadow");
    return () => {
      document.documentElement.classList.remove("garden-alive", "garden-alive--no-meadow");
    };
  }, []);

  if (showMeadowBackground) return null;
  if (!src) return null;

  return (
    <div className="garden-atmo garden-atmo--no-bg" aria-hidden="true">
      <div className="garden-atmo__illustration">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="garden-atmo__illustration-img"
          draggable={false}
        />
      </div>
    </div>
  );
}