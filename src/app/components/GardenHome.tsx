"use client";

import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar } from "./Chrome";
import { GardenAtmosphere } from "./GardenAtmosphere";
import { GardenCard } from "./GardenCard";
import {
  GardenBirdsongProvider,
  GardenBirdsongMuteButton,
} from "./GardenBirdsong";
import type { GardenNode } from "@/lib/garden";
import { showMeadowBackground } from "@/lib/garden-illustrations";

type GardenHomeProps = {
  cells: { node: GardenNode; span: string }[];
};

export function GardenHome({ cells }: GardenHomeProps) {
  return (
    <GardenBirdsongProvider>
      <main
        className={
          showMeadowBackground
            ? "garden-alive"
            : "garden-alive garden-alive--no-meadow"
        }
      >
        <GardenAtmosphere />
        <SiteNav trailing={<GardenBirdsongMuteButton />} />
        <MobileSectionBar />

        <div className="mx-auto w-full max-w-[1080px] px-8 pt-[5.75rem] sm:pt-[4.5rem]">
          <section className="garden-grid">
            <div className="intro-cell">
              <Reveal>
                <div className="intro-script">
                  <p className="intro-script__p">
                    Hey there, I&apos;m <strong>KP</strong>{" "}
                    <span aria-hidden="true">&#128075;</span> Welcome to my
                    digital garden <span aria-hidden="true">&#127793;</span> I
                    like building things, and I&apos;m currently shipping on
                    Base and Farcaster.
                  </p>
                  <p className="intro-script__p">
                    In my free time, I enjoy <strong>trekking</strong>,{" "}
                    <strong>climbing</strong>, and brewing{" "}
                    <strong>coffee</strong>.
                  </p>
                  <p className="intro-script__p">
                    I do some <strong>reading</strong> and{" "}
                    <strong>writing</strong> as well, albeit not as
                    consistently, but I&apos;m working on being better at that.
                  </p>
                </div>
              </Reveal>
            </div>

            {cells.map(({ node, span }) => (
              <GardenCard key={node.id} node={node} className={span} />
            ))}
          </section>
        </div>

        <SiteFooter />
      </main>
    </GardenBirdsongProvider>
  );
}