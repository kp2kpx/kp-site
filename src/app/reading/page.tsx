import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../Reveal";
import { SectionShell } from "../components/SectionShell";
import { getGardenNodes } from "@/lib/posts";
import { byKind } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Reading, KP",
  description: "A shelf of books KP has read. Each one has its own page, with KP's take if he has one.",
};

/* The shelf: book covers in a grid. Each cover links to that
   book's own little page (NOT an aggregate views page). When a
   cover image is not in yet, fall back to a titled spine block
   so the shelf is navigable with placeholder data. */
export default function ReadingPage() {
  const nodes = getGardenNodes();
  const books = byKind(nodes, "reading");

  return (
    <SectionShell
      current="/reading/"
      eyebrow="Reading"
      title="The shelf"
      intro="Books I have read. Tap a cover for the page, and my take if I have one."
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((b, i) => (
          <Reveal key={b.id} delay={(i % 4) * 50}>
            <Link
              href={`/reading/${b.id}/`}
              className="card-lift group block"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-(--color-border) bg-(--color-panel)">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image}
                    alt={b.imageAlt ?? b.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-end p-3">
                    <span className="font-[family-name:var(--font-display)] text-sm font-semibold leading-snug text-(--color-ink)">
                      {b.title}
                    </span>
                    {b.author ? (
                      <span className="mt-1 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)">
                        {b.author}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              {b.takeaway ? (
                <span className="mt-2 inline-block font-[family-name:var(--font-mono)] text-[11px] text-(--color-accent)">
                  has a take
                </span>
              ) : null}
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
