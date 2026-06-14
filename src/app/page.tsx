import Reveal from "./Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./components/Chrome";
import { FeedCard, NoteCard } from "./components/FeedCard";
import { PROFILE } from "./content";
import { getGardenNodes } from "@/lib/posts";
import { recentNodes } from "@/lib/garden";

/* ============================================================
   HOME (the KP garden front door). Warm, calm, paper-and-ink.
   A short hand-written hero, then a masonry photo feed of the
   most recent things across the whole garden graph, with a
   quiet text-only "note" woven in for rhythm.

   "KP" only here. Full name appears solely on the CV page.
   ============================================================ */

/* A quiet thought, shown as a text-only note card between the
   photos. True to KP's own operating principle. */
const NOTE = {
  kicker: "Note",
  text: "Build the smallest thing that teaches you the next thing.",
  when: "an operating principle",
};

export default function Home() {
  const recent = recentNodes(getGardenNodes(), 7);

  return (
    <main>
      <SiteNav />
      <MobileSectionBar />

      {/* hero */}
      <section className="relative overflow-hidden pt-36 pb-10 sm:pt-44 sm:pb-14">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container>
          <div className="max-w-[620px]">
            <Reveal delay={60}>
              <h1 className="font-[family-name:var(--font-display)] text-[34px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[40px]">
                Hi, I&apos;m KP.{" "}
                <span className="text-gradient-gold">This is my garden,</span> a
                quiet place I tend over time.
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 text-[19px] leading-relaxed text-(--color-ink-dim)">
                Notes, photos, things I&apos;m reading and building. No feed
                algorithm. Just what I felt like keeping. {PROFILE.hook}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* recent things feed */}
      <section className="pb-24">
        <Container>
          <div className="flex items-center gap-3.5 py-7 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.18em] text-(--color-ink-faint)">
            <span>Lately</span>
            <span aria-hidden className="h-px flex-1 bg-(--color-border)" />
          </div>

          <div className="feed">
            {recent.slice(0, 3).map((n, i) => (
              <FeedCard key={n.id} node={n} index={i} />
            ))}
            {/* a quiet note woven into the feed for rhythm */}
            <NoteCard note={NOTE} index={3} />
            {recent.slice(3).map((n, i) => (
              <FeedCard key={n.id} node={n} index={i + 4} />
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
