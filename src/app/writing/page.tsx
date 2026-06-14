import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../Reveal";
import { SectionShell } from "../components/SectionShell";
import { getAllPostMeta, formatDate } from "@/lib/posts";
import { ArrowUpRight } from "../components/icons";

export const metadata: Metadata = {
  title: "Writing, KP",
  description:
    "Notes from inside the Base and Farcaster ecosystem. Community, building, and shipping live products.",
};

/* The Writing section. Lists markdown posts from content/posts.
   Posts are also garden nodes (see lib/posts getGardenNodes), so
   they can link to and from projects, books, story beats, etc. */
export default function WritingPage() {
  const posts = getAllPostMeta();

  return (
    <SectionShell
      current="/writing/"
      eyebrow="Writing"
      title="Writing"
      intro="Notes from inside the Base and Farcaster ecosystem. Community, building, and shipping live products."
    >
      {posts.length === 0 ? (
        <p className="text-(--color-ink-faint)">Nothing published yet. Soon.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <Link
                href={`/writing/${p.slug}/`}
                className="card-lift group relative block overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-panel) p-7"
              >
                <span className="arrow" aria-hidden>
                  <ArrowUpRight />
                </span>
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
    </SectionShell>
  );
}
