import type { Metadata } from "next";
import type { ReactNode } from "react";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, Container } from "../components/Chrome";
import { CV, LINKS, PROFILE } from "../content";

/* ============================================================
   CV page. The ONLY place on the site where the full name
   "K.P. Singh" appears (hard naming rule: KP everywhere else).
   Content mirrors kp-cv/v2/KP_Singh_CV.html. Download points
   at /cv.pdf in public/.
   ============================================================ */

const FULL_NAME = "K.P. Singh";

type CvEntry = {
  title: string;
  org?: string;
  dates: string;
  bullets: string[];
};

function CvSection({
  title,
  children,
  className = "mt-14",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-accent)">
          {title}
        </h2>
      </Reveal>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function CvEntryBlock({ entry, delay = 0 }: { entry: CvEntry; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <article>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-[family-name:var(--font-display)] text-[20px] font-medium leading-snug">
            {entry.title}
            {entry.org ? (
              <span className="font-[family-name:var(--font-sans)] text-[16px] font-normal text-(--color-ink-dim)">
                , {entry.org}
              </span>
            ) : null}
          </h3>
          <span className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] italic text-(--color-ink-faint)">
            {entry.dates}
          </span>
        </div>
        <ul className="mt-3 space-y-2 pl-0">
          {entry.bullets.map((bullet) => (
            <li
              key={bullet}
              className="relative pl-5 text-[16px] leading-relaxed text-(--color-ink-dim) before:absolute before:left-0 before:top-[0.62em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-(--color-accent)"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

export const metadata: Metadata = {
  title: "K.P. Singh, CV",
  description:
    "Curriculum vitae: crypto ecosystem growth, community operator, and AI-native builder across Base and Farcaster.",
};

export default function CVPage() {
  const contactLinks = [
    CV.website,
    { label: `Farcaster ${LINKS.farcaster.handle}`, url: LINKS.farcaster.url },
    { label: `X ${LINKS.x.handle}`, url: LINKS.x.url },
    { label: `GitHub ${LINKS.github.handle}`, url: LINKS.github.url },
    { label: `Telegram ${LINKS.telegram.handle}`, url: LINKS.telegram.url },
  ];

  return (
    <main>
      <SiteNav />

      <section className="relative overflow-hidden pt-32 pb-8 sm:pt-40 sm:pb-12">
        <Container className="max-w-[720px]">
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
          <Reveal delay={140}>
            <p className="mt-4 text-[18px] font-medium text-(--color-accent)">
              {CV.tagline}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-5 space-y-2 text-[15px] leading-relaxed text-(--color-ink-dim)">
              <p>
                <a
                  href={LINKS.email.url}
                  className="transition-colors hover:text-(--color-accent)"
                >
                  {LINKS.email.handle}
                </a>
                <span className="mx-2 text-(--color-border-strong)">|</span>
                {CV.phone}
                <span className="mx-2 text-(--color-border-strong)">|</span>
                {PROFILE.location}
              </p>
              <p className="flex flex-wrap gap-x-2 gap-y-1">
                {contactLinks.map((link, i) => (
                  <span key={link.url} className="inline-flex items-center">
                    {i > 0 ? (
                      <span className="mr-2 text-(--color-border-strong)">|</span>
                    ) : null}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-(--color-accent)"
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <div className="hairline" />

      <Container className="max-w-[720px] py-12 sm:py-16">
        <CvSection title="Summary" className="mt-0">
          <Reveal>
            <p className="text-[17px] leading-relaxed text-(--color-ink-dim)">
              {CV.summary}
            </p>
          </Reveal>
        </CvSection>

        <CvSection title="Ecosystem growth & community">
          <div className="space-y-10">
            {CV.ecosystem.map((entry, i) => (
              <CvEntryBlock key={entry.title} entry={entry} delay={i * 40} />
            ))}
          </div>
        </CvSection>

        <CvSection title="Experience">
          <div className="space-y-10">
            {CV.experience.map((entry, i) => (
              <CvEntryBlock key={entry.title + entry.dates} entry={entry} delay={i * 40} />
            ))}
            <Reveal delay={CV.experience.length * 40}>
              <p className="text-[16px] leading-relaxed text-(--color-ink-dim)">
                <span className="font-medium text-(--color-ink)">
                  {CV.earlierExperience.label}:{" "}
                </span>
                {CV.earlierExperience.body}
              </p>
            </Reveal>
          </div>
        </CvSection>

        <CvSection title="Selected builds">
          <div className="space-y-5">
            {CV.builds.map((build, i) => (
              <Reveal key={build.name} delay={i * 40}>
                <p className="text-[16px] leading-relaxed text-(--color-ink-dim)">
                  <span className="font-[family-name:var(--font-display)] text-[18px] font-medium text-(--color-ink)">
                    {build.name}
                  </span>
                  <span className="text-(--color-ink-faint)">, </span>
                  {build.body}
                  {build.url ? (
                    <>
                      {" "}
                      <a
                        href={build.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-[family-name:var(--font-mono)] text-[13px] text-(--color-accent) underline-offset-2 hover:underline"
                      >
                        {build.urlLabel ?? build.url}
                      </a>
                    </>
                  ) : null}
                </p>
              </Reveal>
            ))}
          </div>
        </CvSection>

        <CvSection title="Skills">
          <div className="space-y-4">
            {CV.skills.map((skill, i) => (
              <Reveal key={skill.label} delay={i * 40}>
                <p className="text-[16px] leading-relaxed text-(--color-ink-dim)">
                  <span className="font-medium text-(--color-ink)">{skill.label}: </span>
                  {skill.body}
                </p>
              </Reveal>
            ))}
          </div>
        </CvSection>

        <CvSection title="Education">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-[family-name:var(--font-display)] text-[20px] font-medium text-(--color-ink)">
                {CV.education.degree}
              </p>
              <span className="font-[family-name:var(--font-mono)] text-[12px] italic text-(--color-ink-faint)">
                {CV.education.year}
              </span>
            </div>
          </Reveal>
        </CvSection>
      </Container>

      <SiteFooter />
    </main>
  );
}