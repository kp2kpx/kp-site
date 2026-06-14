import Link from "next/link";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "./Chrome";
import { RelatedStrip } from "./NodeCard";
import type { GardenNode } from "@/lib/garden";

/* ============================================================
   Generic detail page for any non-writing node (project, book,
   hobby, story beat). Renders the node's body, image, external
   link, tags, and the connected-nodes strip (links + backlinks).
   Writing nodes use the existing /articles markdown renderer.
   Structural only; Designer styles on top.
   ============================================================ */
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
              href={backHref}
              className="font-[family-name:var(--font-mono)] text-[12px] text-(--color-ink-faint) transition-colors hover:text-(--color-accent)"
            >
              &larr; {backLabel}
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-6 flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[12px] text-(--color-accent)">
              {node.status ? <span>{node.status}</span> : null}
              {node.date ? <span>{node.date}</span> : null}
              {node.author ? (
                <span className="text-(--color-ink-faint)">{node.author}</span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {node.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 text-lg leading-relaxed text-(--color-ink-dim)">
              {node.summary}
            </p>
          </Reveal>

          {node.image ? (
            <Reveal delay={180}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={node.image}
                alt={node.imageAlt ?? node.title}
                className="mt-8 w-full rounded-xl border border-(--color-border)"
              />
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
              <div className="mt-8 rounded-xl border border-(--color-border) bg-(--color-panel) p-6">
                <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-(--color-accent)">
                  My take
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-(--color-ink-dim)">
                  {node.takeaway}
                </p>
              </div>
            </Reveal>
          ) : null}

          {node.stack && node.stack.length > 0 ? (
            <Reveal delay={230}>
              <div className="mt-6 flex flex-wrap gap-2">
                {node.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-(--color-border) px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)"
                  >
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
                className="mt-8 inline-block rounded-full border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                {node.externalLabel ?? "Visit"} &#8599;
              </a>
            </Reveal>
          ) : null}

          {node.tags.length > 0 ? (
            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap gap-2">
                {node.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-(--color-border) px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-(--color-ink-faint)"
                  >
                    #{t}
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
