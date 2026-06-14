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
   photo per beat, chapters in order. Warm paper-and-ink garden
   treatment: each beat is a tall section with its photo set in a
   rounded warm card, era in mono, title in serif, copy below,
   and a link into the beat's own node page where related nodes
   connect the graph. No round counts, no invented facts.
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
      <section className="relative overflow-hidden pt-36 pb-10 sm:pt-44">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
              The story
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[40px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[56px]">
              No straight line.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 max-w-[620px] text-[19px] leading-relaxed text-(--color-ink-dim)">
              Lucknow. A cafe I built by hand. A cyclone that took it. The
              Himalayas. A borrowed laptop. Every chapter was an unmarked deep
              end, which is exactly the skill the work needs now.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* beats: one section per chapter, photo card + copy */}
      <Container>
        <div className="space-y-20 py-16 sm:space-y-28 sm:py-20">
          {beats.map((b, i) => (
            <section key={b.id} className="border-t border-(--color-border) pt-14">
              <Reveal>
                <div className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.14em] text-(--color-accent)">
                  {b.era ?? b.date}
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[40px]">
                  {b.title}
                </h2>
              </Reveal>

              {b.image ? (
                <Reveal delay={120}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.image}
                    alt={b.imageAlt ?? b.title}
                    className="mt-7 w-full rounded-[18px] border border-(--color-border) object-cover"
                    style={{ maxHeight: "560px" }}
                  />
                </Reveal>
              ) : null}

              {b.video ? (
                <Reveal delay={130}>
                  {/* lazy: metadata only; downloads on play */}
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={b.videoPoster}
                    className="mt-5 w-full rounded-[18px] border border-(--color-border) bg-black"
                    style={{ maxHeight: "560px" }}
                  >
                    <source src={b.video} type="video/mp4" />
                  </video>
                </Reveal>
              ) : null}

              <Reveal delay={140}>
                <p className="mt-6 max-w-[620px] text-[19px] leading-relaxed text-(--color-ink-dim)">
                  {b.body ?? b.summary}
                </p>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href={`/story/${b.id}/`}
                  className="mt-5 inline-block font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
                >
                  More on this chapter &rarr;
                </Link>
              </Reveal>
            </section>
          ))}
        </div>
      </Container>

      <SiteFooter />
    </main>
  );
}
