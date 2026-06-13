import Link from "next/link";
import { PROFILE } from "../content";

/* Shared nav + footer for article pages. Mirrors the homepage
   chrome so the blog feels native. Internal links use next/link
   so navigation works cleanly under static export with
   trailingSlash, and resolves correctly on IPFS gateways. */

function Container({
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

export function ArticleNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-(--color-border) bg-[rgba(10,10,11,0.72)] backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight"
        >
          K.P. Singh
          <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] font-normal text-(--color-ink-faint)">
            {PROFILE.handle}
          </span>
        </Link>
        <nav className="hidden gap-7 text-[13px] text-(--color-ink-dim) sm:flex">
          <Link href="/#now" className="transition-colors hover:text-(--color-ink)">Now</Link>
          <Link href="/#story" className="transition-colors hover:text-(--color-ink)">Story</Link>
          <Link href="/#community" className="transition-colors hover:text-(--color-ink)">Community</Link>
          <Link href="/#builds" className="transition-colors hover:text-(--color-ink)">Builds</Link>
          <Link href="/articles/" className="text-(--color-accent) transition-colors hover:text-(--color-accent-soft)">Articles</Link>
        </nav>
        <Link
          href="/#contact"
          className="rounded-full border border-(--color-border-strong) px-4 py-1.5 text-[13px] font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
        >
          Get in touch
        </Link>
      </Container>
    </header>
  );
}

export function ArticleFooter() {
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
