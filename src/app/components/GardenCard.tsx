import Link from "next/link";
import type { GardenNode, NodeKind } from "@/lib/garden";
import { canonicalHref } from "@/lib/garden";
import { ArrowUpRight } from "./icons";

/* Dot-format a date for card captions/meta. Keeps the house rule
   of no dashes (2026-06-13 -> 2026.06.13). Ranges and plain years
   pass through with any hyphens swapped for a thin separator. */
function dotDate(raw?: string): string {
  if (!raw) return "";
  // ISO single date -> dotted
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.replace(/-/g, ".");
  // year range like "2019 - 2021" -> "2019 to 2021" (no dash)
  if (/\d{4}\s*-\s*\d{4}/.test(raw)) return raw.replace(/\s*-\s*/g, " to ");
  return raw;
}

/* ============================================================
   GardenCard (Chester layout, garden-v2).

   One garden node, rendered as a card in the home grid. Four
   visual variants, all sharing the same hover contract:

     .card        = the lifting / shadow / background layer
                    (overflow:hidden so the inner scale is clipped)
     .scale-target= the only layer that scales on hover (media)
     .eyebrow     = category, top-left, OUTSIDE scale-target
     .arrow       = corner arrow, top-right, OUTSIDE scale-target,
                    solidifies into a filled circle on hover

   The exact hover values live in globals.css (.card / .scale-
   target / .arrow). This component only assigns structure and
   the right variant per node kind.

   Variants:
     photo   - full-bleed image + caption (story beats, photo hobbies)
     project - inset screenshot frame + title
     book    - cover + READING/READ badge + title + author
     text    - date + title + 2-3 line excerpt (writing, notes)

   Every field shown is the node's own TRUE data. No round
   counts, no invented facts. "KP" only; full name lives on CV.
   ============================================================ */

/* Human section labels for the eyebrow prefix, keyed by the
   node's home kind. */
const SECTION_LABEL: Record<NodeKind, string> = {
  project: "Projects",
  writing: "Writing",
  reading: "Reading",
  hobby: "Hobbies",
  story: "Story",
};

/* The bold subsection part of the eyebrow. We use the node's own
   title for projects / story, a fixed "Books" for reading, and a
   tag-derived label for hobbies so it reads "Hobbies / Climbing"
   etc. Falls back to the section name. */
function subsectionFor(node: GardenNode): string {
  const home = node.kinds[0];
  if (home === "reading") return "Books";
  if (home === "writing") return "Blog";
  if (home === "hobby") {
    const t = node.tags[0];
    if (t) return t.charAt(0).toUpperCase() + t.slice(1);
    return "Off the keyboard";
  }
  // projects + story: use the node title, kept short
  return node.title;
}

function Eyebrow({ node, onPhoto }: { node: GardenNode; onPhoto?: boolean }) {
  const section = SECTION_LABEL[node.kinds[0]];
  const sub = subsectionFor(node);
  return (
    <div className={`eyebrow${onPhoto ? " on-photo" : ""}`}>
      {section} &middot; <b>{sub}</b>
    </div>
  );
}

function Arrow({ onPhoto }: { onPhoto?: boolean }) {
  return (
    <span className={`arrow${onPhoto ? " on-photo" : ""}`} aria-hidden>
      <ArrowUpRight />
    </span>
  );
}

function GoodreadsArrow({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="arrow book-goodreads-arrow"
      aria-label="View on Goodreads"
    >
      <ArrowUpRight />
      <span className="book-goodreads-arrow__label">view on goodreads</span>
    </a>
  );
}

export type BookBadgeStatus = "reading" | "to-read" | "read";

const BOOK_BADGE_LABEL: Record<BookBadgeStatus, string> = {
  reading: "Reading",
  "to-read": "To read",
  read: "Read",
};

/* Shelf badge: explicit readStatus wins; else takeaway = read;
   else to-read tag; else read (on-shelf default). */
export function bookBadge(node: GardenNode): { label: string; cls: BookBadgeStatus } {
  if (node.readStatus) {
    return { label: BOOK_BADGE_LABEL[node.readStatus], cls: node.readStatus };
  }
  if (node.tags.includes("to-read")) {
    return { label: BOOK_BADGE_LABEL["to-read"], cls: "to-read" };
  }
  if (node.takeaway) return { label: BOOK_BADGE_LABEL.read, cls: "read" };
  return { label: BOOK_BADGE_LABEL.read, cls: "read" };
}

export function GardenCard({
  node,
  className = "",
  shelf = false,
}: {
  node: GardenNode;
  className?: string;
  /** Reading shelf: hide per-card eyebrow (page shows section label). */
  shelf?: boolean;
}) {
  const home = node.kinds[0];
  const href = canonicalHref(node);

  /* ----- PHOTO variant: story beats, image-bearing hobbies ----- */
  const isPhoto =
    Boolean(node.image) && (home === "story" || home === "hobby");

  /* ----- BOOK variant ----- */
  if (home === "reading") {
    const badge = bookBadge(node);
    const cover = (
      <div className="cover-wrap">
        {node.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={node.image}
            alt={node.imageAlt ?? node.title}
            loading="lazy"
            className="cover scale-target"
          />
        ) : (
          <div className="cover scale-target cover-fallback" aria-hidden />
        )}
      </div>
    );
    const meta = (
      <div className="book-meta">
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
        <div className="b-title">{node.title}</div>
        {node.author ? <div className="b-author">{node.author}</div> : null}
      </div>
    );

    if (shelf) {
      return (
        <div className={`card book book--shelf ${className}`}>
          <Link href={href} className="book-shelf__hit">
            {cover}
            {meta}
          </Link>
          {node.externalUrl ? (
            <GoodreadsArrow url={node.externalUrl} />
          ) : (
            <Arrow />
          )}
        </div>
      );
    }

    return (
      <Link href={href} className={`card book ${className}`}>
        <Eyebrow node={node} />
        <Arrow />
        {cover}
        {meta}
      </Link>
    );
  }

  /* ----- PHOTO variant ----- */
  if (isPhoto) {
    return (
      <Link href={href} className={`card photo ${className}`}>
        <div className="card-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.image}
            alt={node.imageAlt ?? node.title}
            loading="lazy"
            className="scale-target"
          />
        </div>
        <div className="photo-grad" />
        <Eyebrow node={node} onPhoto />
        <Arrow onPhoto />
        <div className="photo-cap">{dotDate(node.date) || node.title}</div>
      </Link>
    );
  }

  /* ----- PROJECT variant: with image -> inset screenshot ----- */
  if (home === "project" && node.image) {
    return (
      <Link href={href} className={`card project ${className}`}>
        <Eyebrow node={node} />
        <Arrow />
        <div className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.image}
            alt={node.imageAlt ?? node.title}
            loading="lazy"
            className="scale-target"
          />
        </div>
        <div className="proj-title">{node.title}</div>
      </Link>
    );
  }

  /* ----- TEXT variant: projects with no image, writing, stories
     with no image. Carries date + title + excerpt. ----- */
  return (
    <Link href={href} className={`card text ${className}`}>
      <Eyebrow node={node} />
      <Arrow />
      <div className="scale-target text-body">
        {node.status || node.date ? (
          <div className="t-date">{node.status ?? dotDate(node.date)}</div>
        ) : null}
        <div className="t-title">{node.title}</div>
        {node.summary ? <div className="t-excerpt">{node.summary}</div> : null}
      </div>
    </Link>
  );
}
