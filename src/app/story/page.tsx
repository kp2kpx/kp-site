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
   STORY: the centerpiece. A slow cinematic vertical descent,
   not a chapter list. The page reads like a short film:

     - an OPENING TITLE that fills the screen and sets the tone
       before any chapter begins,
     - then one BEAT per chapter, each held in near-full-viewport
       height so the reader sits with it on scroll,
     - photo and video beats break FULL-BLEED (edge to edge),
       far wider than the reading column, so the image carries
       the moment; the prose stays at a calm reading measure
       under it,
     - beats with no photo become TITLE CARDS: a film intertitle,
       large Fraunces display type centered in air, intentional
       rather than empty.

   The story NODE model is untouched: beats still come from the
   graph (byKind story), still link into each node's own detail
   page where "Grows alongside" backlinks connect the graph.
   No round counts, no invented facts. Warm paper-and-ink palette.
   ============================================================ */

export default function StoryPage() {
  const beats = byKind(getGardenNodes(), "story").sort(
    (a, b) => (a.chapter ?? 999) - (b.chapter ?? 999)
  );

  return (
    <main>
      <SiteNav current="/story/" />
      <MobileSectionBar current="/story/" />

      {/* ---------------------------------------------------------
          OPENING TITLE. A film opening card: full-height, the
          title held alone in space before the chapters begin.
          --------------------------------------------------------- */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container className="py-32">
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.24em] text-(--color-accent)">
              The story
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-[56px] font-medium leading-[1.04] tracking-[-0.03em] sm:text-[88px]">
              No straight line.
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-8 max-w-[600px] text-[20px] leading-relaxed text-(--color-ink-dim) sm:text-[21px]">
              Lucknow. A cafe I built by hand. A cyclone that took it. The
              Himalayas. A borrowed laptop. Every chapter was an unmarked deep
              end, which is exactly the skill the work needs now.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div
              aria-hidden
              className="mt-16 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.24em] text-(--color-ink-faint)"
            >
              Scroll
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------
          THE BEATS. One per chapter, each given near-full-viewport
          height so it is held on scroll. Photo / video beats go
          full-bleed; text-only beats become intertitle cards.
          --------------------------------------------------------- */}
      {beats.map((b) => {
        const hasMedia = Boolean(b.image) || Boolean(b.video);

        return (
          <section
            key={b.id}
            className="flex min-h-[88vh] flex-col justify-center py-24 sm:py-32"
          >
            {hasMedia ? (
              <>
                {b.image ? (
                  <Reveal>
                    <FullBleed>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.image}
                        alt={b.imageAlt ?? b.title}
                        className="h-[58vh] max-h-[680px] min-h-[320px] w-full object-cover sm:h-[72vh]"
                      />
                    </FullBleed>
                  </Reveal>
                ) : null}

                {b.video ? (
                  <Reveal delay={b.image ? 80 : 0}>
                    <FullBleed className={b.image ? "mt-5" : ""}>
                      {/* lazy: metadata only; downloads on play */}
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={b.videoPoster}
                        className="h-[58vh] max-h-[680px] min-h-[320px] w-full bg-black object-cover sm:h-[72vh]"
                      >
                        <source src={b.video} type="video/mp4" />
                      </video>
                    </FullBleed>
                  </Reveal>
                ) : null}

                <Container>
                  <div className="mt-12 sm:mt-16">
                    <Reveal>
                      <div className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.18em] text-(--color-accent)">
                        {b.era ?? b.date}
                      </div>
                    </Reveal>
                    <Reveal delay={80}>
                      <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[34px] font-medium leading-[1.12] tracking-[-0.02em] sm:text-[48px]">
                        {b.title}
                      </h2>
                    </Reveal>
                    <Reveal delay={140}>
                      <p className="mt-6 max-w-[640px] text-[19px] leading-relaxed text-(--color-ink-dim) sm:text-[20px]">
                        {b.body ?? b.summary}
                      </p>
                    </Reveal>
                    <Reveal delay={200}>
                      <Link
                        href={`/story/${b.id}/`}
                        className="mt-7 inline-block font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
                      >
                        More on this chapter &rarr;
                      </Link>
                    </Reveal>
                  </div>
                </Container>
              </>
            ) : (
              <Container>
                <div className="mx-auto max-w-[760px] text-center">
                  <Reveal>
                    <div className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.24em] text-(--color-accent)">
                      {b.era ?? b.date}
                    </div>
                  </Reveal>
                  <Reveal delay={100}>
                    <h2 className="mt-7 font-[family-name:var(--font-display)] text-[40px] font-medium leading-[1.08] tracking-[-0.025em] sm:text-[64px]">
                      {b.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={180}>
                    <p className="mx-auto mt-8 max-w-[600px] text-[19px] leading-relaxed text-(--color-ink-dim) sm:text-[20px]">
                      {b.body ?? b.summary}
                    </p>
                  </Reveal>
                  <Reveal delay={240}>
                    <Link
                      href={`/story/${b.id}/`}
                      className="mt-9 inline-block font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
                    >
                      More on this chapter &rarr;
                    </Link>
                  </Reveal>
                </div>
              </Container>
            )}
          </section>
        );
      })}

      <SiteFooter />
    </main>
  );
}

/* ============================================================
   FullBleed: breaks a child out of the centered reading column
   to span the full viewport width, using the standard
   left/right margin trick. body has overflow-x: hidden so there
   is no horizontal scrollbar. Used for the cinematic photo and
   video beats.
   ============================================================ */
function FullBleed({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
