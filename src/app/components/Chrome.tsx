import Link from "next/link";
import { LINKS } from "../content";
import { FarcasterIcon, XIcon, GitHubIcon } from "./icons";

/* ============================================================
   Shared site chrome: the top nav and footer used by every
   section. Structural only; the Designer styles on top.

   Nav layout (per brief):
     left  : KP (home) / Projects / Writing / Reading / Hobbies / Story
     right : Farcaster / X / GitHub as ICONS, then CV (the word)

   "KP" is the only name used in chrome. The full name
   "K.P. Singh" appears ONLY on the CV page.
   ============================================================ */

export const SECTIONS: { label: string; href: string }[] = [
  { label: "Projects", href: "/projects/" },
  { label: "Writing", href: "/writing/" },
  { label: "Reading", href: "/reading/" },
  { label: "Hobbies", href: "/hobbies/" },
  { label: "Story", href: "/story/" },
];

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* current: the section href to mark active, e.g. "/projects/". */
export function SiteNav({ current = "" }: { current?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-(--color-border) bg-[rgba(10,10,11,0.72)] backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4">
        {/* left: home + sections */}
        <nav className="flex min-w-0 items-center gap-5 text-[13px] text-(--color-ink-dim)">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-display)] text-sm font-bold tracking-tight text-(--color-ink)"
          >
            KP
          </Link>
          <span aria-hidden className="hidden h-4 w-px bg-(--color-border-strong) sm:block" />
          <span className="hidden items-center gap-5 sm:flex">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`transition-colors hover:text-(--color-ink) ${
                  current === s.href ? "text-(--color-accent)" : ""
                }`}
              >
                {s.label}
              </Link>
            ))}
          </span>
        </nav>

        {/* right: doors out (icons) + CV (word) */}
        <div className="flex shrink-0 items-center gap-4 text-(--color-ink-dim)">
          <a
            href={LINKS.farcaster.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Farcaster"
            title="Farcaster"
            className="transition-colors hover:text-(--color-accent)"
          >
            <FarcasterIcon className="h-[18px] w-[18px]" />
          </a>
          <a
            href={LINKS.x.url}
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            title="X"
            className="transition-colors hover:text-(--color-accent)"
          >
            <XIcon className="h-[16px] w-[16px]" />
          </a>
          <a
            href={LINKS.github.url}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="transition-colors hover:text-(--color-accent)"
          >
            <GitHubIcon className="h-[17px] w-[17px]" />
          </a>
          <Link
            href="/cv/"
            className="rounded-full border border-(--color-border-strong) px-3 py-1 text-[13px] font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            CV
          </Link>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-(--color-border) py-8">
      <Container className="flex flex-col items-center justify-between gap-3 text-[12px] text-(--color-ink-faint) sm:flex-row">
        <span className="font-[family-name:var(--font-mono)]">KP · @kpx</span>
        <span>Built by KP. Every line on this page is true.</span>
      </Container>
    </footer>
  );
}

/* Small mobile section bar: the left-nav sections collapse on
   narrow screens, so expose them as a scrollable row under the
   fixed header. Structural; Designer can restyle or replace. */
export function MobileSectionBar({ current = "" }: { current?: string }) {
  return (
    <div className="fixed inset-x-0 top-14 z-40 border-b border-(--color-border) bg-[rgba(10,10,11,0.72)] backdrop-blur-md sm:hidden">
      <div className="flex gap-4 overflow-x-auto px-6 py-2 text-[13px] text-(--color-ink-dim)">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`whitespace-nowrap ${
              current === s.href ? "text-(--color-accent)" : ""
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
