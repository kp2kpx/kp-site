import type { Metadata } from "next";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, Container } from "../components/Chrome";
import { PROFILE, STORY, COMMUNITY } from "../content";

/* ============================================================
   CV page. The ONLY place on the site where the full name
   "K.P. Singh" appears (hard naming rule: KP everywhere else).
   Warm garden styling to match the rest of the site. The
   download button points at /cv.pdf (the real PDF lives in
   public/cv.pdf).

   Content is sourced from content.ts (PROFILE, STORY,
   COMMUNITY) so the page stays in sync with the source of truth.
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

      <section className="relative overflow-hidden pt-32 pb-8 sm:pt-40 sm:pb-12">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container className="max-w-[680px]">
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
              Curriculum vitae
            </span>
          </Reveal>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <Reveal delay={80}>
              <h1 className="font-[family-name:var(--font-display)] text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
                {FULL_NAME}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <a
                href="/cv.pdf"
                download
                className="rounded-full border border-(--color-border-strong) px-5 py-2.5 font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                Download PDF
              </a>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <p className="mt-5 text-[19px] leading-relaxed text-(--color-ink-dim)">
              {PROFILE.identity}. {PROFILE.location}.
            </p>
          </Reveal>
        </Container>
      </section>

      <div className="hairline" />

      <Container className="max-w-[680px] py-12 sm:py-16">
        {/* Summary */}
        <Reveal>
          <p className="text-[17px] leading-relaxed text-(--color-ink-dim)">
            {PROFILE.hook}
          </p>
        </Reveal>

        {/* Experience / timeline */}
        <div className="mt-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
              Experience
            </h2>
          </Reveal>
          <div className="mt-8 space-y-10">
            {STORY.map((s, i) => (
              <Reveal key={s.year} delay={i * 50}>
                <div className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.14em] text-(--color-accent)">
                  {s.year}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-[22px] font-medium leading-snug">
                  {s.title}
                </h3>
                <p className="mt-2 text-[16px] leading-relaxed text-(--color-ink-dim)">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Community / ecosystem */}
        <div className="mt-16">
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
              Ecosystem and community
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {COMMUNITY.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 50} className="h-full">
                <div className="h-full rounded-[18px] border border-(--color-border) bg-(--color-panel) p-6">
                  <span className="chip">{c.tag}</span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-[20px] font-medium leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-(--color-ink-dim)">
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
