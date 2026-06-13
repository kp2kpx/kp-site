import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Reveal from "../../Reveal";
import { getPostBySlug, getPostSlugs, formatDate } from "@/lib/posts";
import { ArticleNav, ArticleFooter } from "../SiteChrome";

type Params = { slug: string };

/* Pre-render one static page per markdown file at build time. */
export function generateStaticParams(): Params[] {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found, K.P. Singh" };
  return {
    title: `${post.title}, K.P. Singh`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      url: `/articles/${post.slug}/`,
      title: post.title,
      description: post.excerpt,
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/og.png"],
    },
  };
}

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-3xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <ArticleNav />

      <article className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[680px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200,162,74,0.14), rgba(79,127,255,0.08) 45%, transparent 70%)",
          }}
        />
        <Container>
          <Reveal>
            <Link
              href="/articles/"
              className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
            >
              &larr; All articles
            </Link>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-6 flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[12px] text-(--color-accent)">
              <span>{formatDate(post.date)}</span>
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-(--color-border) px-2 py-0.5 text-[11px] text-(--color-ink-faint)"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <div
              className="prose mt-10"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-16 border-t border-(--color-border) pt-8">
              <Link
                href="/articles/"
                className="font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
              >
                &larr; Back to all articles
              </Link>
            </div>
          </Reveal>
        </Container>
      </article>

      <ArticleFooter />
    </main>
  );
}
