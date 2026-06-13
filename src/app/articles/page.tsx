import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../Reveal";
import { getAllPostMeta, formatDate } from "@/lib/posts";
import { ArticleNav, ArticleFooter } from "./SiteChrome";

export const metadata: Metadata = {
  title: "Articles, K.P. Singh",
  description:
    "Notes on building in the Base and Farcaster ecosystem, community, and shipping live products. Weekly.",
  openGraph: {
    type: "website",
    url: "/articles/",
    title: "Articles, K.P. Singh",
    description:
      "Notes on building in the Base and Farcaster ecosystem, community, and shipping live products. Weekly.",
    images: ["/og.png"],
  },
};

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

export default function ArticlesPage() {
  const posts = getAllPostMeta();

  return (
    <main>
      <ArticleNav />

      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
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
              Writing
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Articles
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--color-ink-dim)">
              Notes from inside the Base and Farcaster ecosystem. Community,
              building, and shipping live products. New piece most weeks.
            </p>
          </Reveal>
        </Container>
      </section>

      <div className="hairline" />

      <section className="py-16 sm:py-20">
        <Container>
          {posts.length === 0 ? (
            <p className="text-(--color-ink-faint)">
              No articles yet. Check back soon.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link
                    href={`/articles/${p.slug}/`}
                    className="card-lift group block rounded-2xl border border-(--color-border) bg-(--color-panel) p-7"
                  >
                    <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[12px] text-(--color-accent)">
                      <span>{formatDate(p.date)}</span>
                      {p.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-(--color-border) px-2 py-0.5 text-[11px] text-(--color-ink-faint)"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight sm:text-2xl">
                      {p.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-(--color-ink-dim)">
                      {p.excerpt}
                    </p>
                    <span className="mt-4 inline-block font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors group-hover:text-(--color-accent)">
                      Read &rarr;
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <ArticleFooter />
    </main>
  );
}
