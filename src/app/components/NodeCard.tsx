import Link from "next/link";
import Reveal from "../Reveal";
import type { GardenNode } from "@/lib/garden";
import { canonicalHref } from "@/lib/garden";

/* ============================================================
   A single garden node, rendered as a card. Used by every
   section list and by related-node strips. Structural styling
   only; the Designer refines the look.

   Links to the node's canonical detail page (its first kind's
   section), so the same node is reachable at one URL no matter
   which section surfaces it.
   ============================================================ */
export function NodeCard({ node, delay = 0 }: { node: GardenNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={canonicalHref(node)}
        className="card-lift group block h-full rounded-2xl border border-(--color-border) bg-(--color-panel) p-6"
      >
        {node.status ? (
          <span className="inline-block rounded-full bg-(--color-accent)/12 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-accent-soft)">
            {node.status}
          </span>
        ) : node.date ? (
          <span className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-accent)">
            {node.date}
          </span>
        ) : null}
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {node.title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-(--color-ink-dim)">
          {node.summary}
        </p>
        {node.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {node.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md border border-(--color-border) px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </Reveal>
  );
}

/* Compact related-node strip for detail pages: shows the union
   of outgoing links and backlinks so the graph is walkable. */
export function RelatedStrip({ related }: { related: GardenNode[] }) {
  if (related.length === 0) return null;
  return (
    <div className="mt-16 border-t border-(--color-border) pt-8">
      <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
        Connected
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {related.map((n, i) => (
          <NodeCard key={n.id} node={n} delay={i * 50} />
        ))}
      </div>
    </div>
  );
}
