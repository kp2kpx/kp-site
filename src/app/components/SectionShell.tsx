import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./Chrome";

/* ============================================================
   Standard wrapper for a section page: fixed nav, a hero
   header (eyebrow + title + intro), the page body, and footer.
   Keeps every section structurally identical so the Designer's
   visual pass drops in once and applies everywhere.
   ============================================================ */
export function SectionShell({
  current,
  eyebrow,
  title,
  intro,
  children,
}: {
  current: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <SiteNav current={current} />
      <MobileSectionBar current={current} />

      <section className="relative overflow-hidden pt-36 pb-12 sm:pt-44 sm:pb-16">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[760px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200,162,74,0.16), rgba(79,127,255,0.10) 45%, transparent 70%)",
          }}
        />
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
              {eyebrow}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {title}
            </h1>
          </Reveal>
          {intro ? (
            <Reveal delay={150}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim)">
                {intro}
              </p>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <div className="hairline" />

      <section className="py-14 sm:py-20">
        <Container>{children}</Container>
      </section>

      <SiteFooter />
    </main>
  );
}
