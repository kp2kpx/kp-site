import Link from "next/link";
import Reveal from "../Reveal";
import type { GardenNode } from "@/lib/garden";
import { canonicalHref } from "@/lib/garden";
import { ExternalArrow, externalHoverLabel } from "./ExternalArrow";

/* ============================================================
   A single garden node, rendered as a warm card. Used by every
   section list. Photo (when present) -> kicker -> serif title ->
   note -> chips. Springy alternating tilt via .card-lift.

   RelatedStrip below is the wiki "Grows alongside" treatment:
   thumbnail + title + tag-sub chips that tilt on hover, so the
   graph is walkable.
   ============================================================ */

const LEAF_TAGS = new Set([
  "goa",
  "himalayas",
  "himalaya",
  "outdoors",
  "trekking",
  "nature",
  "cyclone",
  "music",
  "loss",
  "turning-point",
]);

export function NodeCard({ node, delay = 0 }: { node: GardenNode; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className={`card-lift group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-(--color-border) bg-(--color-panel)${node.externalUrl ? " card-lift--has-external" : ""}`}
      >
        <Link
          href={canonicalHref(node)}
          className="tile-hit flex h-full flex-col"
        >
        {node.image ? (
          <div className="scale-target h-44 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.image}
              alt={node.imageAlt ?? node.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-6">
          {node.status ? (
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
              {node.status}
            </span>
          ) : node.date ? (
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
              {node.date}
            </span>
          ) : null}
          <h3 className="mt-2.5 font-[family-name:var(--font-display)] text-[22px] font-medium leading-[1.25] tracking-[-0.01em]">
            {node.title}
          </h3>
          <p className="mt-2 text-[16px] leading-[1.55] text-(--color-ink-dim)">
            {node.summary}
          </p>
          {node.tags.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {node.tags.slice(0, 4).map((t) => (
                <span key={t} className={`chip ${LEAF_TAGS.has(t) ? "leaf" : ""}`}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        </Link>
        {node.externalUrl ? (
          <ExternalArrow
            url={node.externalUrl}
            ariaLabel={node.externalLabel ?? "Open external link"}
            hoverLabel={externalHoverLabel(node)}
            onPhoto={Boolean(node.image)}
          />
        ) : null}
      </div>
    </Reveal>
  );
}

/* Wiki "Grows alongside" strip: related nodes as tilt-on-hover
   chips (thumbnail + title + tag-sub). Shows the union of
   outgoing links and backlinks so the graph stays walkable. */
export function RelatedStrip({ related }: { related: GardenNode[] }) {
  if (related.length === 0) return null;
  return (
    <div className="mt-14 border-t border-(--color-border) pt-8">
      <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-ink-faint)">
        Grows alongside
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {related.map((n) => (
          <Link key={n.id} href={canonicalHref(n)} className="related-chip">
            {n.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={n.image} alt="" className="thumb" />
            ) : (
              <span className="thumb" aria-hidden />
            )}
            <span>
              <span className="block font-[family-name:var(--font-display)] text-[15px] leading-tight text-(--color-ink)">
                {n.title}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-(--color-ink-faint)">
                {n.tags.slice(0, 2).join(" · ") || n.kinds[0]}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
