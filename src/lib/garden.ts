/* ============================================================
   THE GARDEN: the content graph.

   This is the architectural core of the site. Content is not
   pages, it is NODES. A node is one thing KP made, read, did,
   or lived: a project, a book, a hobby, a story chapter, a
   writing post. Each node:

     - lives ONCE (single source of truth, no duplication)
     - carries TAGS (free-form topic labels)
     - can surface in MULTIPLE sections via its `kinds`
     - CROSS-LINKS to other nodes via `links` (outgoing refs)

   Backlinks (who links to me) are computed, never authored.
   Sections (Projects, Reading, Hobbies, Story, Writing) are
   just queries over this graph by kind.

   Example: the Fresh2O cafe is ONE node. It has kinds
   ["project", "story"], so it appears under Projects AND as a
   Story chapter. It links to the GLADAITORS and hostel nodes.

   Markdown writing posts (content/posts/*.md) are folded into
   this same graph at build time by lib/posts.ts, so a blog
   post is just another node and can be linked to/from anything.

   Every field here must be TRUE. Placeholders are marked
   PLACEHOLDER and must be confirmed before publishing widely.

   PHOTOS: image paths point at /public/garden/*.jpg, optimised
   from KP's real archive (scripts/optimize-garden.mjs). Notes
   are kept light and TRUE; dates come from the filenames and
   KP's real timeline. KP can re-caption or move any of these by
   editing the node here.
   ============================================================ */

export type NodeKind = "project" | "writing" | "reading" | "hobby" | "story";

export type GardenNode = {
  /* Stable slug. Used in URLs and as the link target id. */
  id: string;

  /* A node can live in more than one section. Order is not
     significant. The first kind is treated as the node's
     "home" section for its canonical detail route. */
  kinds: NodeKind[];

  title: string;

  /* One-line summary used in cards and feeds. */
  summary: string;

  /* Free-form topic tags. Drive related-node discovery and
     filtering. Lowercase, hyphenated. */
  tags: string[];

  /* ISO date (YYYY-MM-DD) or a human range like "2018 - 2021".
     Used for ordering feeds and timelines. `sortDate` is the
     machine-sortable anchor; `date` is what gets displayed. */
  date?: string;
  sortDate?: string;

  /* Outgoing links to other node ids. Backlinks are derived
     from these automatically (see backlinksFor). */
  links?: string[];

  /* Longer body copy for the node's own detail page. Plain
     text or simple inline markup; the visual layer styles it.
     For writing posts this is empty (body comes from markdown). */
  body?: string;

  /* Optional hero / cover image (path under /public). For
     Reading this is the book cover; for Story the beat photo;
     for Projects/Hobbies a representative image. */
  image?: string;
  imageAlt?: string;

  /* Optional embedded video (path under /public) for a beat
     that is better told as motion. videoPoster is the still
     shown before play; the clip is lazy (preload metadata only)
     so the static IPFS build stays light. */
  video?: string;
  videoPoster?: string;

  /* External destination (live product, book purchase page,
     external article). Internal nodes still get their own
     detail page even when this is set. */
  externalUrl?: string;
  externalLabel?: string;

  /* ---- kind-specific extras (all optional) ---- */

  /* project */
  status?: string; // e.g. "Live mini-app", "Closed 2021"
  stack?: string[];

  /* reading */
  author?: string;
  takeaway?: string; // KP's own take, if any. Empty = just on the shelf.

  /* story */
  chapter?: number; // ordering for the cinematic vertical scroll
  era?: string; // displayed era label, e.g. "2018 - 2021"
};

/* ============================================================
   THE NODES.
   Add new content by appending a node here (or, for writing,
   by dropping a markdown file in content/posts: those are
   merged in at build time, see lib/posts.ts -> getGardenNodes).
   ============================================================ */
export const NODES: GardenNode[] = [
  /* ---------- projects ---------- */
  {
    id: "fresh2o",
    kinds: ["project", "story"],
    title: "Fresh2O",
    summary:
      "A beachside smoothie cafe in Goa I built with my own hands, then lost to a cyclone.",
    tags: ["goa", "hospitality", "built-by-hand", "fresh2o"],
    date: "2019 - 2021",
    sortDate: "2020-03-16",
    status: "Closed 2021",
    chapter: 2,
    era: "2018 - 2021",
    links: ["goa-hostel", "open-mics"],
    body:
      "I opened Fresh2O, a beachside smoothie cafe I built myself: woodwork, paint, plumbing, electrical, every shift. In 2021 the second COVID wave and Cyclone Tauktae destroyed it. The cafe did not fail. Acts of god did.",
    image: "/garden/cafe-lanterns-night.jpg",
    imageAlt: "Lantern-lit rooftop cafe at night, plants and fairy lights",
  },
  {
    id: "goa-hostel",
    kinds: ["project", "story"],
    title: "The traveller hostel",
    summary:
      "Ran a traveller hostel in Goa solo: front desk, ops, marketing, the lot.",
    tags: ["goa", "hospitality", "operations"],
    date: "2018 - 2021",
    sortDate: "2019-07-19",
    status: "Closed 2021",
    era: "2018 - 2021",
    links: ["fresh2o", "open-mics"],
    body:
      "I ran a traveller hostel solo and built websites, social, menus and visiting cards for Goa businesses on the side.",
    image: "/garden/goa-coast-monsoon.jpg",
    imageAlt: "Monsoon view through trees down to the Goa coast, red tiled roofs below",
  },
  {
    id: "open-mics",
    kinds: ["project"],
    title: "Goa open mics",
    summary: "Ran twice-weekly open mics in Goa end to end, host to teardown.",
    tags: ["goa", "events", "music", "community"],
    date: "2018 - 2021",
    sortDate: "2019-10-09",
    status: "Closed 2021",
    links: ["goa-hostel"],
    body:
      "Twice-weekly open mics, run end to end: booking, sound, hosting, and the teardown after.",
    image: "/garden/goa-courtyard-dogs.jpg",
    imageAlt: "Painted courtyard with graffiti walls and a couple of street dogs",
  },
  {
    id: "gladaitors",
    kinds: ["project"],
    title: "GLADAITORS",
    summary:
      "A Farcaster mini-app betting game on Base. AI gladiators fight onchain; players bet on the outcome, 10% house cut.",
    tags: ["farcaster", "base", "solidity", "nextjs", "onchain-game"],
    date: "2026",
    sortDate: "2026-05-01",
    status: "Live mini-app",
    stack: ["Farcaster", "Base", "Solidity", "Next.js"],
    externalUrl: "https://gladaitors.vercel.app/",
    externalLabel: "gladaitors.vercel.app",
    links: ["based-games"],
  },
  {
    id: "farcaster-intel-api",
    kinds: ["project"],
    title: "Farcaster Intel API",
    summary:
      "A paid API built on the x402 v2 payment standard: pay-per-call data for the Farcaster ecosystem. Listed on x402scan.",
    tags: ["x402", "base", "api", "farcaster"],
    date: "2026",
    sortDate: "2026-04-01",
    status: "Live, on x402scan",
    stack: ["x402", "Base", "API", "Farcaster"],
    externalUrl: "https://farcaster-intel-api.vercel.app",
    externalLabel: "farcaster-intel-api.vercel.app",
  },
  {
    id: "based-games",
    kinds: ["project"],
    title: "Based Games",
    summary:
      "Two seasons of an onchain community game that kept the community playing and shipping together.",
    tags: ["base", "onchain-game", "community", "farcaster"],
    date: "2025",
    sortDate: "2025-01-01",
    status: "2 seasons run",
    links: ["gladaitors"],
  },

  /* ---------- reading ----------
     Each book is its own node with its own little page. The
     page holds KP's take ONLY if `takeaway` is set; otherwise
     it is simply on the shelf. Never an aggregate views page.
     These two are clean placeholders: KP is sending the real
     shelf. Do not fabricate books. */
  {
    id: "book-placeholder-vitalik",
    kinds: ["reading"],
    title: "PLACEHOLDER: Vitalik writings",
    summary: "PLACEHOLDER book entry. Replace with a real shelf item.",
    tags: ["ethereum", "crypto"],
    author: "PLACEHOLDER",
    takeaway:
      "PLACEHOLDER: this is where KP's own take on the book goes, if he has one.",
    image: "",
    imageAlt: "PLACEHOLDER book cover",
  },
  {
    id: "book-placeholder-2",
    kinds: ["reading"],
    title: "PLACEHOLDER: a book on the shelf",
    summary: "PLACEHOLDER. A book KP read, no take written yet.",
    tags: ["placeholder"],
    author: "PLACEHOLDER",
    image: "",
    imageAlt: "PLACEHOLDER book cover",
  },

  /* ---------- hobbies ---------- */
  {
    id: "hobby-chess",
    kinds: ["hobby"],
    title: "Chess",
    summary:
      "Chess is a constant. It also became a show: I play a guest while we talk crypto.",
    tags: ["chess", "community"],
    links: ["fresh2o"],
    body: "PLACEHOLDER: a few lines about chess and photos.",
    image: "",
    imageAlt: "PLACEHOLDER chess photo",
  },
  {
    id: "hobby-trekking",
    kinds: ["hobby"],
    title: "Trekking",
    summary: "The Himalayas kept me afloat once. I keep going back.",
    tags: ["himalayas", "outdoors", "trekking"],
    date: "2021",
    sortDate: "2021-09-02",
    links: ["himalayas"],
    body:
      "The mountains are the reset button. Feet over the edge of a cliff swing, clouds below, signal somewhere in there. I keep going back.",
    image: "/garden/himalaya-cliff-swing.jpg",
    imageAlt: "Feet resting on a cliff-edge swing above a deep cloud-filled Himalayan valley",
  },
  {
    id: "hobby-music",
    kinds: ["hobby"],
    title: "Music",
    summary: "Open mics in Goa started here. Still play.",
    tags: ["music"],
    links: ["open-mics"],
    body: "PLACEHOLDER: music notes and photos.",
    image: "",
    imageAlt: "PLACEHOLDER music photo",
  },

  /* ---------- story ----------
     Cinematic vertical chapters. One strong photo per beat,
     ordered by `chapter`. Some story beats double as project
     nodes (fresh2o, goa-hostel above). */
  {
    id: "story-lucknow",
    kinds: ["story"],
    title: "Lucknow, and a lot of deep ends",
    summary:
      "B.Com in Economics, then a decade of being thrown into the deep end.",
    tags: ["lucknow", "finance", "origin"],
    chapter: 1,
    era: "2006 - 2018",
    body:
      "B.Com in Economics from the University of Lucknow. Then a decade of deep ends: QuickBooks support at an IBM call centre, self-taught forex and stock trading, an investment-advisor stint at Angel Broking, and coordinating US trucking dispatch and accounts remotely from India. I learned to operate where nobody hands you a manual.",
    image: "",
    imageAlt: "PLACEHOLDER Lucknow photo",
  },
  /* chapter 2 = fresh2o (also a project), see above */
  {
    id: "story-cyclone",
    kinds: ["story"],
    title: "The cyclone",
    summary: "In 2021 a second COVID wave and Cyclone Tauktae took the cafe.",
    tags: ["goa", "cyclone", "loss"],
    chapter: 3,
    era: "2021",
    sortDate: "2021-05-16",
    links: ["fresh2o"],
    body:
      "In 2021 the second COVID wave and Cyclone Tauktae destroyed Fresh2O. The cafe did not fail. Acts of god did. This is the coast in the days the storm came through.",
    image: "/garden/goa-windblown-palms.jpg",
    imageAlt: "Palms bent in storm wind over a rough grey sea under a heavy monsoon sky",
    video: "/garden/cafe-cyclone-week.mp4",
    videoPoster: "/garden/cafe-cyclone-week-poster.jpg",
  },
  {
    id: "himalayas",
    kinds: ["story"],
    title: "Broke, in the Himalayas, on a phone",
    summary:
      "I went to the mountains and traded crypto on a phone wherever I could find signal.",
    tags: ["himalayas", "crypto", "turning-point"],
    chapter: 4,
    era: "2021",
    sortDate: "2021-09-12",
    links: ["borrowed-laptop", "hobby-trekking"],
    body:
      "After the cafe I went to the mountains and traded crypto on a mobile phone wherever I could find signal. It kept me afloat. I found Vitalik's writing and decided to learn how this actually works.",
    image: "/garden/himalaya-misty-valley.jpg",
    imageAlt: "Mist rolling through a forested Himalayan valley under low cloud",
  },
  {
    id: "borrowed-laptop",
    kinds: ["story"],
    title: "A borrowed laptop",
    summary:
      "October 2021: borrowed money from my parents and a laptop from my girlfriend, and taught myself Solidity from zero.",
    tags: ["solidity", "self-taught", "turning-point"],
    chapter: 5,
    era: "2021",
    links: ["himalayas", "gladaitors", "farcaster-intel-api"],
    body:
      "That October I borrowed money from my parents and a laptop from my girlfriend, and taught myself Solidity from zero: no prior coding, no HTML. Just contracts and NFTs until they worked. The first salary I earned later bought the laptop I still build on today.",
    image: "",
    imageAlt: "PLACEHOLDER borrowed laptop photo",
  },
];

/* ============================================================
   QUERIES over the graph. Sections call these.
   ============================================================ */

/* Build a lookup once. */
function indexById(nodes: GardenNode[]): Map<string, GardenNode> {
  const m = new Map<string, GardenNode>();
  for (const n of nodes) m.set(n.id, n);
  return m;
}

export function byKind(nodes: GardenNode[], kind: NodeKind): GardenNode[] {
  return nodes.filter((n) => n.kinds.includes(kind));
}

export function getNode(
  nodes: GardenNode[],
  id: string
): GardenNode | undefined {
  return indexById(nodes).get(id);
}

/* Outgoing links resolved to nodes (skips dangling ids). */
export function linkedNodes(
  nodes: GardenNode[],
  node: GardenNode
): GardenNode[] {
  const idx = indexById(nodes);
  return (node.links ?? [])
    .map((id) => idx.get(id))
    .filter((n): n is GardenNode => Boolean(n));
}

/* Backlinks: every node that links TO this one. Computed, not
   authored, so the graph stays consistent automatically. */
export function backlinksFor(
  nodes: GardenNode[],
  id: string
): GardenNode[] {
  return nodes.filter((n) => (n.links ?? []).includes(id));
}

/* Related = union of outgoing links and backlinks, de-duped.
   This is what a node's detail page shows as "connected". */
export function relatedNodes(
  nodes: GardenNode[],
  node: GardenNode
): GardenNode[] {
  const out = linkedNodes(nodes, node);
  const back = backlinksFor(nodes, node.id);
  const seen = new Set<string>();
  const all: GardenNode[] = [];
  for (const n of [...out, ...back]) {
    if (n.id === node.id || seen.has(n.id)) continue;
    seen.add(n.id);
    all.push(n);
  }
  return all;
}

/* Nodes sharing at least one tag, excluding self. Used as a
   softer discovery signal than explicit links. */
export function nodesByTag(nodes: GardenNode[], tag: string): GardenNode[] {
  return nodes.filter((n) => n.tags.includes(tag));
}

/* The home feed: most recent things across every kind. */
export function recentNodes(nodes: GardenNode[], limit = 6): GardenNode[] {
  return [...nodes]
    .filter((n) => n.sortDate || n.date)
    .sort((a, b) => {
      const da = a.sortDate ?? a.date ?? "";
      const db = b.sortDate ?? b.date ?? "";
      return da < db ? 1 : -1;
    })
    .slice(0, limit);
}

/* The canonical detail route for a node: its first kind's
   section. Keeps every node addressable at one URL even when
   it surfaces in several sections. */
export function canonicalHref(node: GardenNode): string {
  const home = node.kinds[0];
  const section: Record<NodeKind, string> = {
    project: "projects",
    writing: "writing",
    reading: "reading",
    hobby: "hobbies",
    story: "story",
  };
  return `/${section[home]}/${node.id}/`;
}
