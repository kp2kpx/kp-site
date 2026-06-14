import Reveal from "./Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./components/Chrome";
import { NodeCard } from "./components/NodeCard";
import { PROFILE } from "./content";
import { getGardenNodes } from "@/lib/posts";
import { recentNodes } from "@/lib/garden";

/* ============================================================
   HOME (the KP landing). Calm by design: a short hero and a
   recent-things feed drawn from the garden graph (projects,
   writing, story beats, whatever is newest). The deep content
   lives in the sections; this is the front door.

   "KP" only here. Full name appears solely on the CV page.
   Visual polish is the Designer's pass; this is the structure.
   ============================================================ */
export default function Home() {
  const recent = recentNodes(getGardenNodes(), 6);

  return (
    <main>
      <SiteNav />
      <MobileSectionBar />

      {/* hero */}
      <section className="relative overflow-hidden pt-40 pb-20 sm:pt-52 sm:pb-28">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200,162,74,0.16), rgba(79,127,255,0.10) 45%, transparent 70%)",
          }}
        />
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              KP, {PROFILE.handle}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              A garden of things I have{" "}
              <span className="text-gradient-gold">made, read, and lived.</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim) sm:text-xl">
              {PROFILE.hook}
            </p>
          </Reveal>
        </Container>
      </section>

      <div className="hairline" />

      {/* recent things feed */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              Recent things
            </span>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
              Lately
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((n, i) => (
              <NodeCard key={n.id} node={n} delay={(i % 3) * 60} />
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
