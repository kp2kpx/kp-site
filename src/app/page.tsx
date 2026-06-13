import Reveal from "./Reveal";
import { PROFILE, LINKS, NOW, STORY, COMMUNITY, BUILDS } from "./content";

/* ---------- small primitives ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
      {children}
    </span>
  );
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-6 sm:px-8 ${className}`}>{children}</div>;
}

/* ---------- nav ---------- */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-(--color-border) bg-[rgba(10,10,11,0.72)] backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <a href="#top" className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight">
          K.P. Singh
          <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] font-normal text-(--color-ink-faint)">
            {PROFILE.handle}
          </span>
        </a>
        <nav className="hidden gap-7 text-[13px] text-(--color-ink-dim) sm:flex">
          <a href="#now" className="transition-colors hover:text-(--color-ink)">Now</a>
          <a href="#story" className="transition-colors hover:text-(--color-ink)">Story</a>
          <a href="#community" className="transition-colors hover:text-(--color-ink)">Community</a>
          <a href="#builds" className="transition-colors hover:text-(--color-ink)">Builds</a>
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-(--color-border-strong) px-4 py-1.5 text-[13px] font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
        >
          Get in touch
        </a>
      </Container>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* grid texture */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      {/* soft glow */}
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
          <SectionLabel>Crypto-native · Base &amp; Farcaster</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Crypto-native builder{" "}
            <span className="text-gradient-gold">&amp; ecosystem operator</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim) sm:text-xl">
            {PROFILE.hook}
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#community"
              className="rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-[#1a1505] transition-transform hover:-translate-y-0.5"
            >
              See the proof
            </a>
            <a
              href={LINKS.email.url}
              className="rounded-full border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
            >
              Work with me
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint)">
            {[LINKS.farcaster, LINKS.x, LINKS.github, LINKS.email].map((l) => (
              <a
                key={l.label}
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="transition-colors hover:text-(--color-accent)"
              >
                {l.label}{" "}
                <span className="text-(--color-ink-dim)">{l.handle}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- now ---------- */

function Now() {
  return (
    <section id="now" className="py-20 sm:py-28">
      <Container>
        <Reveal><SectionLabel>What I do now</SectionLabel></Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
            I turn builders into a community, and a community into shipped products.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-border) sm:grid-cols-3">
          {NOW.map((n, i) => (
            <Reveal key={n.title} delay={i * 70} className="bg-(--color-bg)">
              <div className="h-full bg-(--color-panel) p-7">
                <div className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-accent)">
                  0{i + 1}
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
                  {n.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-(--color-ink-dim)">
                  {n.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- story ---------- */

function Story() {
  return (
    <section id="story" className="relative py-20 sm:py-28">
      <Container>
        <Reveal><SectionLabel>The story</SectionLabel></Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
            Finance → a café and a cyclone → Solidity on a borrowed laptop → the ecosystem.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-4 max-w-2xl text-[15px] text-(--color-ink-faint)">
            No straight line. Every chapter was an unmarked deep end — which is exactly the skill the work needs now.
          </p>
        </Reveal>

        <div className="relative mt-14 sm:pl-8">
          {/* vertical line */}
          <div
            aria-hidden
            className="absolute left-[5px] top-2 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-(--color-accent)/50 via-(--color-border-strong) to-transparent sm:block"
          />
          <div className="space-y-12">
            {STORY.map((s, i) => (
              <Reveal key={s.year} delay={i * 60} className="relative">
                <div
                  aria-hidden
                  className="absolute -left-8 top-1.5 hidden h-2.5 w-2.5 rounded-full bg-(--color-accent) ring-4 ring-(--color-accent)/15 sm:block"
                />
                <div className="font-[family-name:var(--font-mono)] text-[12px] tracking-wider text-(--color-accent)">
                  {s.year}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-(--color-ink-dim)">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- community ---------- */

function Community() {
  return (
    <section id="community" className="relative py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-(--color-bg-2)" />
      <Container>
        <Reveal><SectionLabel>Ecosystem &amp; community — the proof</SectionLabel></Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
            This is the DevRel job, already done — on my own time, for the community.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 70}>
              <div className="card-lift h-full rounded-2xl border border-(--color-border) bg-(--color-panel) p-6">
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
      </Container>
    </section>
  );
}

/* ---------- builds ---------- */

function Builds() {
  return (
    <section id="builds" className="py-20 sm:py-28">
      <Container>
        <Reveal><SectionLabel>Builds</SectionLabel></Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
            Live products, not screenshots.
          </h2>
        </Reveal>
        <div className="mt-12 space-y-4">
          {BUILDS.map((b, i) => {
            const isLink = b.url.length > 0;
            const Wrapper = isLink ? "a" : "div";
            return (
              <Reveal key={b.name} delay={i * 60}>
                <Wrapper
                  {...(isLink ? { href: b.url, target: "_blank", rel: "noreferrer" } : {})}
                  className={`card-lift group block rounded-2xl border border-(--color-border) bg-(--color-panel) p-7 ${
                    isLink ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
                          {b.name}
                        </h3>
                        <span className="rounded-full bg-(--color-accent)/12 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-accent-soft)">
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-3 text-[15px] leading-relaxed text-(--color-ink-dim)">
                        {b.blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {b.stack.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-(--color-border) px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint)">
                      <span className={isLink ? "group-hover:text-(--color-accent) transition-colors" : ""}>
                        {b.urlLabel}
                        {isLink ? " ↗" : ""}
                      </span>
                    </div>
                  </div>
                </Wrapper>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------- contact ---------- */

function Contact() {
  const links = [LINKS.email, LINKS.x, LINKS.farcaster, LINKS.github, LINKS.telegram];
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-0 -z-10 h-[420px] w-[760px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 70%, rgba(200,162,74,0.14), rgba(139,127,255,0.08) 50%, transparent 70%)",
        }}
      />
      <Container className="text-center">
        <Reveal><SectionLabel>Contact</SectionLabel></Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-5xl">
            Building a Base or Farcaster ecosystem team?{" "}
            <span className="text-gradient-gold">Let&apos;s talk.</span>
          </h2>
        </Reveal>
        <Reveal delay={130}>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-(--color-ink-dim)">
            {PROFILE.location} · open to remote. DevRel, Developer Advocacy, Ecosystem and Community roles.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="card-lift rounded-xl border border-(--color-border) bg-(--color-panel) px-5 py-3 text-left"
              >
                <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-(--color-ink-faint)">
                  {l.label}
                </div>
                <div className="mt-0.5 text-[14px] font-medium text-(--color-ink) group-hover:text-(--color-accent)">
                  {l.handle}
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-(--color-border) py-8">
      <Container className="flex flex-col items-center justify-between gap-3 text-[12px] text-(--color-ink-faint) sm:flex-row">
        <span className="font-[family-name:var(--font-mono)]">
          K.P. Singh · {PROFILE.handle}
        </span>
        <span>Built by KP. Every line on this page is true.</span>
      </Container>
    </footer>
  );
}

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <div className="hairline" />
      <Now />
      <div className="hairline" />
      <Story />
      <div className="hairline" />
      <Community />
      <div className="hairline" />
      <Builds />
      <div className="hairline" />
      <Contact />
      <Footer />
    </main>
  );
}
