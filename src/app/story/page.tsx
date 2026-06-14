import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "../components/Chrome";
import { getGardenNodes } from "@/lib/posts";
import { byKind } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Story, KP",
  description:
    "Lucknow, a cafe, a cyclone, the Himalayas, a borrowed laptop. The long way into the ecosystem.",
};

/* ============================================================
   STORY: the centerpiece. Slow, cinematic, vertical. One strong
   photo per beat, chapters in order. This pass SCAFFOLDS the
   structure: full-height beat sections, ordered by chapter, with
   a photo slot per beat and the copy in place. The Designer
   drives the cinematic feel (parallax, scroll pacing, type) on
   top of this skeleton. Each beat also links to its own detail
   page, where related nodes connect the graph.
   ============================================================ */
export default function StoryPage() {
  const beats = byKind(getGardenNodes(), "story").sort(
    (a, b) => (a.chapter ?? 999) - (b.chapter ?? 999)
  );

  return (
    <main>
      <SiteNav current="/story/" />
      <MobileSectionBar current="/story/" />

      {/* opening beat */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden pt-28">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              The story
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              No straight line.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim)">
              Lucknow. A cafe I built by hand. A cyclone that took it. The
              Himalayas. A borrowed laptop. Every chapter was an unmarked deep
              end, which is exactly the skill the work needs now.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* beats: one full-height section per chapter, photo slot + copy */}
      {beats.map((b, i) => (
        <section
          key={b.id}
          className="relative flex min-h-[90vh] items-center border-t border-(--color-border) py-20"
        >
          {/* photo slot: full-bleed image when present, faint
              placeholder block when not. Designer can swap this for
              a parallax / pinned-scroll treatment. */}
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
            {b.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.image}
                alt={b.imageAlt ?? b.title}
                className="h-full w-full object-cover opacity-30"
              />
            ) : (
              <div className="h-full w-full bg-(--color-bg-2)" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-(--color-bg) via-(--color-bg)/70 to-(--color-bg)/30" />
          </div>

          <Container>
            <Reveal>
              <div className="font-[family-name:var(--font-mono)] text-[12px] tracking-wider text-(--color-accent)">
                {b.era ?? b.date}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {b.title}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim)">
                {b.body ?? b.summary}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link
                href={`/story/${b.id}/`}
                className="mt-6 inline-block font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
              >
                More on this chapter &rarr;
              </Link>
            </Reveal>
            {/* image not in yet marker, dev-facing via alt text only */}
            {!b.image ? (
              <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)">
                photo slot {i + 1}: {b.imageAlt}
              </p>
            ) : null}
          </Container>
        </section>
      ))}

      <SiteFooter />
    </main>
  );
}
