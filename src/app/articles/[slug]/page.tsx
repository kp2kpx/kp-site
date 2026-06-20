import type { Metadata } from "next";
import Link from "next/link";
import { getPostSlugs } from "@/lib/posts";
import { RedirectTo } from "../../components/RedirectTo";

type Params = { slug: string };

/* Old per-article URLs now live under /writing/[slug]. Pre-render
   the same slugs and redirect each to its new home on the client. */
export function generateStaticParams(): Params[] {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Writing, KP", description: `Moved to /writing/${slug}/.` };
}

export default async function ArticleRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return (
    <RedirectTo to={`/writing/${slug}/`}>
      <Link href={`/writing/${slug}/`}>Continue to the article</Link>
    </RedirectTo>
  );
}
