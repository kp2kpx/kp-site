import type { Metadata } from "next";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, Container } from "../components/Chrome";
import { PROFILE, STORY, COMMUNITY } from "../content";

/* ============================================================
   CV page. This is the ONLY place on the site where the full
   name "K.P. Singh" appears (hard naming rule: KP everywhere
   else). Styled like the rest of the site. A download-PDF
   button points at /cv.pdf, which KP drops into /public.

   Content is sourced from content.ts (PROFILE, STORY,
   COMMUNITY) so the CV stays in sync with the single source of
   truth. Structural; Designer refines.
   ============================================================ */

const FULL_NAME = "K.P. Singh"; // CV-only, per naming rule.

export const metadata: Metadata = {
  title: "K.P. Singh, CV",
  description:
    "Curriculum vitae: ex-finance, self-taught Solidity builder, Base and Farcaster ecosystem operator.",
};

export default function CVPage() {
  return (
    <main>
      <SiteNav />

      <section className="relative overflow-hidden pt-36 pb-12 sm:pt-44 sm:pb-16">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container className="max-w-3xl">
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              Curriculum vitae
            </span>
          </Reveal>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <Reveal delay={80}>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                {FULL_NAME}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              {/* PLACEHOLDER target: KP drops the real PDF at public/cv.pdf */}
              <a
                href="/cv.pdf"
                download
                className="rounded-full border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                Download PDF
              </a>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <p className="mt-5 text-lg leading-relaxed text-(--color-ink-dim)">
              {PROFILE.identity}. {PROFILE.location}.
            </p>
          </Reveal>
        </Container>
      </section>

      <div className="hairline" />

      <Container className="max-w-3xl py-14 sm:py-20">
        {/* Summary */}
        <Reveal>
          <p className="text-[15px] leading-relaxed text-(--color-ink-dim)">
            {PROFILE.hook}
          </p>
        </Reveal>

        {/* Experience / timeline */}
        <div className="mt-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              Experience
            </h2>
          </Reveal>
          <div className="mt-8 space-y-10">
            {STORY.map((s, i) => (
              <Reveal key={s.year} delay={i * 50}>
                <div className="font-[family-name:var(--font-mono)] text-[12px] tracking-wider text-(--color-accent)">
                  {s.year}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-(--color-ink-dim)">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Community / ecosystem */}
        <div className="mt-16">
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              Ecosystem and community
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {COMMUNITY.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 50}>
                <div className="rounded-2xl border border-(--color-border) bg-(--color-panel) p-6">
                  <span className="inline-block rounded-full border border-(--color-border-strong) px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-(--color-accent)">
                    {c.tag}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-(--color-ink-dim)">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      <SiteFooter />
    </main>
  );
}
