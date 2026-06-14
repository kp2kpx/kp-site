import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Reveal from "../../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "../../components/Chrome";
import { RelatedStrip } from "../../components/NodeCard";
import {
  getPostBySlug,
  getPostSlugs,
  getGardenNodes,
  formatDate,
} from "@/lib/posts";
import { getNode, relatedNodes } from "@/lib/garden";

type Params = { slug: string };

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
  if (!post) return { title: "Not found, KP" };
  return {
    title: `${post.title}, KP`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      url: `/writing/${post.slug}/`,
      title: post.title,
      description: post.excerpt,
      images: ["/og.png"],
    },
  };
}

/* Writing detail: renders the markdown body, then shows the
   connected nodes for this post from the garden graph (the post
   is itself a node), so a blog post links into projects, books,
   and story beats like everything else. */
export default async function WritingPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const nodes = getGardenNodes();
  const node = getNode(nodes, slug);
  const related = node ? relatedNodes(nodes, node) : [];

  return (
    <main>
      <SiteNav current="/writing/" />
      <MobileSectionBar current="/writing/" />

      <article className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[680px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(200,162,74,0.14), rgba(79,127,255,0.08) 45%, transparent 70%)",
          }}
        />
        <Container className="max-w-3xl">
          <Reveal>
            <Link
              href="/writing/"
              className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
            >
              &larr; All writing
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

          <RelatedStrip related={related} />
        </Container>
      </article>

      <SiteFooter />
    </main>
  );
}
