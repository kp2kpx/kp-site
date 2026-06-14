import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./Chrome";

/* ============================================================
   Standard wrapper for a section page: fixed nav, a warm hero
   header (mono eyebrow + serif title + intro), the page body,
   and footer. Every section is structurally identical so the
   visual system applies once and everywhere.
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

      <section className="relative overflow-hidden pt-32 pb-8 sm:pt-40 sm:pb-12">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <Container>
          <Reveal>
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
              {eyebrow}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-[36px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
              {title}
            </h1>
          </Reveal>
          {intro ? (
            <Reveal delay={150}>
              <p className="mt-5 max-w-[620px] text-[19px] leading-relaxed text-(--color-ink-dim)">
                {intro}
              </p>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <div className="hairline" />

      <section className="py-12 sm:py-16">
        <Container>{children}</Container>
      </section>

      <SiteFooter />
    </main>
  );
}
