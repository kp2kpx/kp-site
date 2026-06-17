import Link from "next/link";
import type { GardenNode, NodeKind } from "@/lib/garden";
import { canonicalHref } from "@/lib/garden";
import { ExternalArrow, externalHoverLabel } from "./ExternalArrow";

/* ============================================================
   Home masonry feed cards (Designer visual system).

   FeedCard: photo (when the node has one) -> mono kicker ->
   serif title -> 1-2 line note -> tag chips -> timestamp.
   Aspect ratio varies by position so the masonry breathes.
   Tilt alternates by index for the springy hover.

   NoteCard: a text-only "quiet thought" variant, italic serif,
   for rhythm between the photos.

   Both are structural + styled here; the warm tokens come from
   globals.css. No round counts, no invented facts: copy is the
   node's own true summary.
   ============================================================ */

/* nature / story tags lean olive; everything else terracotta */
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

const KICKER: Record<NodeKind, string> = {
  project: "Built",
  writing: "Writing",
  reading: "Reading",
  hobby: "Off the keyboard",
  story: "Story",
};

/* deterministic aspect-ratio rotation so the column packing
   stays varied but stable across builds */
const ASPECTS = ["4 / 5", "3 / 4", "3 / 2", "1 / 1", "4 / 5", "3 / 2"];

/* a light, true-ish relative era label from the node date.
   We never claim precision we do not have: a year-range node
   shows its range, a single year shows the year. */
function whenLabel(node: GardenNode): string {
  return node.date ?? "";
}

function tiltVar(index: number): string {
  const tilts = ["-1.2deg", "1.3deg", "-1.0deg", "1.1deg"];
  return tilts[index % tilts.length];
}

export function FeedCard({ node, index }: { node: GardenNode; index: number }) {
  const aspect = ASPECTS[index % ASPECTS.length];
  const kicker = KICKER[node.kinds[0]];
  const when = whenLabel(node);

  const href = canonicalHref(node);

  if (node.externalUrl) {
    return (
      <div
        className="feed-card feed-card--has-external group"
        style={{ ["--tilt" as string]: tiltVar(index) }}
      >
        <Link href={href} className="tile-hit block">
          {node.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.image}
              alt={node.imageAlt ?? node.title}
              loading="lazy"
              className="feed-photo"
              style={{ aspectRatio: aspect }}
            />
          ) : null}
          <div className="px-5 pb-6 pt-5">
            <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
              {kicker}
            </div>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[22px] font-medium leading-[1.25] tracking-[-0.01em]">
              {node.title}
            </h3>
            <p className="mt-2 text-[16px] leading-[1.55] text-(--color-ink-dim)">
              {node.summary}
            </p>
            {node.tags.length > 0 ? (
              <div className="mt-3.5 flex flex-wrap gap-2">
                {node.tags.slice(0, 3).map((t) => (
                  <span key={t} className={`chip ${LEAF_TAGS.has(t) ? "leaf" : ""}`}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {when ? (
              <div className="mt-3.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-(--color-ink-faint)">
                {when}
              </div>
            ) : null}
          </div>
        </Link>
        <ExternalArrow
          url={node.externalUrl}
          ariaLabel={node.externalLabel ?? "Open external link"}
          hoverLabel={externalHoverLabel(node)}
          onPhoto={Boolean(node.image)}
        />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="feed-card group"
      style={{ ["--tilt" as string]: tiltVar(index) }}
    >
      {node.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.image}
          alt={node.imageAlt ?? node.title}
          loading="lazy"
          className="feed-photo"
          style={{ aspectRatio: aspect }}
        />
      ) : null}
      <div className="px-5 pb-6 pt-5">
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
          {kicker}
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-[22px] font-medium leading-[1.25] tracking-[-0.01em]">
          {node.title}
        </h3>
        <p className="mt-2 text-[16px] leading-[1.55] text-(--color-ink-dim)">
          {node.summary}
        </p>
        {node.tags.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {node.tags.slice(0, 3).map((t) => (
              <span key={t} className={`chip ${LEAF_TAGS.has(t) ? "leaf" : ""}`}>
                {t}
              </span>
            ))}
          </div>
        ) : null}
        {when ? (
          <div className="mt-3.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-(--color-ink-faint)">
            {when}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function NoteCard({
  note,
  index,
}: {
  note: { kicker: string; text: string; when: string };
  index: number;
}) {
  return (
    <div
      className="feed-card"
      style={{ ["--tilt" as string]: tiltVar(index) }}
    >
      <div className="px-5 pb-7 pt-6">
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
          {note.kicker}
        </div>
        <p className="mt-3 font-[family-name:var(--font-body)] text-[21px] font-normal italic leading-[1.35] text-(--color-ink)">
          &ldquo;{note.text}&rdquo;
        </p>
        <div className="mt-4 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-(--color-ink-faint)">
          {note.when}
        </div>
      </div>
    </div>
  );
}
