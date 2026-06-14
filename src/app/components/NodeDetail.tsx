import Link from "next/link";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./Chrome";
import { RelatedStrip } from "./NodeCard";
import type { GardenNode } from "@/lib/garden";

/* ============================================================
   Generic detail page for any non-writing node (project, book,
   hobby, story beat). Warm paper-and-ink wiki node: serif title,
   mono meta line, prose, optional photo, external link, tag
   chips, and the "Grows alongside" related strip. Writing nodes
   use the /articles markdown renderer.
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

export function NodeDetail({
  node,
  related,
  current,
  backHref,
  backLabel,
}: {
  node: GardenNode;
  related: GardenNode[];
  current: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <main>
      <SiteNav current={current} />
      <MobileSectionBar current={current} />

      <article className="pt-32 pb-24 sm:pt-36">
        <Container className="max-w-[680px]">
          <Reveal>
            <Link
              href={backHref}
              className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
            >
              &larr; {backLabel}
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.14em] text-(--color-accent)">
              {node.status ? <span>{node.status}</span> : null}
              {node.date ? <span>{node.date}</span> : null}
              {node.author ? (
                <span className="text-(--color-ink-faint)">{node.author}</span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[34px] font-medium leading-[1.12] tracking-[-0.02em] sm:text-[44px]">
              {node.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-4 text-[19px] leading-relaxed text-(--color-ink-dim)">
              {node.summary}
            </p>
          </Reveal>

          {node.image ? (
            <Reveal delay={180}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={node.image}
                alt={node.imageAlt ?? node.title}
                className="mt-8 w-full rounded-[18px] border border-(--color-border)"
              />
            </Reveal>
          ) : null}

          {node.video ? (
            <Reveal delay={190}>
              {/* lazy: preload metadata only so the static IPFS build
                  stays light. The clip downloads only on play. */}
              <video
                controls
                playsInline
                preload="metadata"
                poster={node.videoPoster}
                className="mt-6 w-full rounded-[18px] border border-(--color-border) bg-black"
                style={{ maxHeight: "640px" }}
              >
                <source src={node.video} type="video/mp4" />
              </video>
            </Reveal>
          ) : null}

          {node.body ? (
            <Reveal delay={200}>
              <div className="prose mt-8">
                <p>{node.body}</p>
              </div>
            </Reveal>
          ) : null}

          {node.takeaway ? (
            <Reveal delay={220}>
              <div className="mt-8 rounded-[18px] border border-(--color-border) bg-(--color-panel) p-6">
                <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-(--color-accent)">
                  My take
                </div>
                <p className="mt-3 text-[16px] leading-relaxed text-(--color-ink-dim)">
                  {node.takeaway}
                </p>
              </div>
            </Reveal>
          ) : null}

          {node.stack && node.stack.length > 0 ? (
            <Reveal delay={230}>
              <div className="mt-6 flex flex-wrap gap-2">
                {node.stack.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ) : null}

          {node.externalUrl ? (
            <Reveal delay={250}>
              <a
                href={node.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block rounded-full border border-(--color-border-strong) px-5 py-2.5 font-[family-name:var(--font-mono)] text-[13px] text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                {node.externalLabel ?? "Visit"} &#8599;
              </a>
            </Reveal>
          ) : null}

          {node.tags.length > 0 ? (
            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap gap-2">
                {node.tags.map((t) => (
                  <span key={t} className={`chip ${LEAF_TAGS.has(t) ? "leaf" : ""}`}>
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ) : null}

          <RelatedStrip related={related} />
        </Container>
      </article>

      <SiteFooter />
    </main>
  );
}
