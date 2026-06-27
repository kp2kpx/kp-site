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
  /** Shelf badge: reading, half-read, to-read, or read (finished). */
  readStatus?: "reading" | "half-read" | "to-read" | "read";
  /** KP's shelf favorites: show a star on the cover. */
  favorite?: boolean;

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
  {
    id: "live-stream",
    kinds: ["project"],
    title: "Live Streams",
    summary:
      "Did live streams for Base India and Inner Circle.",
    tags: ["base", "live", "community", "inner-circle"],
    date: "2025 - 2026",
    sortDate: "2025-10-01",
    status: "50+ live streams",
    links: ["live-streams"],
  },

  /* ---------- reading ----------
     KP's real shelf, read off photos of it. Each book is its
     own node with its own little page. The page holds KP's take
     ONLY if `takeaway` is set; otherwise the book simply sits on
     the shelf. `readStatus` drives the shelf badge (reading /
     half-read / to-read / read). Default badge is read when unset.
     the shelf and the take slot is left empty for KP to fill in
     later. Never fabricate a take. Covers are optimised from the
     Goodreads covers into /garden/books (see scripts/sync-goodreads.mjs). externalUrl is the Goodreads book page so a curious reader can click through. */

  /* science & physics */
  {
    id: "book-godel-escher-bach",
    kinds: ["reading"],
    favorite: true,
    title: "Godel, Escher, Bach: An Eternal Golden Braid",
    summary: "Hofstadter on minds, machines, and the strange loops that tie them together.",
    tags: ["science", "minds", "mathematics", "computation"],
    author: "Douglas R. Hofstadter",
    image: "/garden/books/godel-escher-bach.jpg",
    imageAlt: "Cover of Godel, Escher, Bach by Douglas R. Hofstadter",
    externalUrl: "https://www.goodreads.com/book/show/24113.G_del_Escher_Bach",
    externalLabel: "Goodreads",
  },
  {
    id: "book-fabric-of-reality",
    kinds: ["reading"],
    favorite: true,
    title: "The Fabric of Reality",
    summary: "David Deutsch weaves quantum physics, computation, evolution and knowledge into one worldview.",
    tags: ["science", "physics", "deutsch", "how-the-world-works"],
    author: "David Deutsch",
    image: "/garden/books/fabric-of-reality.jpg",
    imageAlt: "Cover of The Fabric of Reality by David Deutsch",
    externalUrl: "https://www.goodreads.com/book/show/177068.The_Fabric_of_Reality",
    externalLabel: "Goodreads",
    links: ["himalayas"],
  },
  {
    id: "book-beginning-of-infinity",
    kinds: ["reading"],
    title: "The Beginning of Infinity",
    summary: "Deutsch on good explanations as the engine of unbounded progress.",
    tags: ["science", "physics", "deutsch", "how-the-world-works"],
    author: "David Deutsch",
    image: "/garden/books/beginning-of-infinity.jpg",
    imageAlt: "Cover of The Beginning of Infinity by David Deutsch",
    externalUrl: "https://www.goodreads.com/book/show/10483171-the-beginning-of-infinity",
    externalLabel: "Goodreads",
    links: ["himalayas"],
  },
  {
    id: "book-brief-history-of-time",
    kinds: ["reading"],
    title: "A Brief History of Time",
    summary: "Hawking's tour from the big bang to black holes for the rest of us.",
    tags: ["science", "physics", "cosmology"],
    author: "Stephen Hawking",
    image: "/garden/books/brief-history-of-time.jpg",
    imageAlt: "Cover of A Brief History of Time by Stephen Hawking",
    externalUrl: "https://www.goodreads.com/book/show/3869.A_Brief_History_of_Time",
    externalLabel: "Goodreads",
  },
  {
    id: "book-short-history-nearly-everything",
    kinds: ["reading"],
    title: "A Short History of Nearly Everything",
    summary: "Bill Bryson on how we figured out the universe, and ourselves.",
    tags: ["science", "history-of-science"],
    author: "Bill Bryson",
    image: "/garden/books/short-history-nearly-everything.jpg",
    imageAlt: "Cover of A Short History of Nearly Everything by Bill Bryson",
    externalUrl: "https://www.goodreads.com/book/show/3333783-a-really-short-history-of-nearly-everything",
    externalLabel: "Goodreads",
  },
  {
    id: "book-singularity-is-near",
    kinds: ["reading"],
    title: "The Singularity Is Near",
    summary: "Kurzweil's original case that accelerating technology will transform human life this century.",
    tags: ["science", "ai", "future"],
    author: "Ray Kurzweil",
    image: "/garden/books/singularity-is-near.jpg",
    imageAlt: "The Singularity Is Near by Ray Kurzweil",
    externalUrl: "https://www.goodreads.com/book/show/83518.The_Singularity_is_Near",
    externalLabel: "Goodreads",
  },
  {
    id: "book-singularity-is-nearer",
    kinds: ["reading"],
    readStatus: "reading",
    title: "The Singularity Is Nearer",
    summary: "Kurzweil's updated case for accelerating returns and the merger of human and machine.",
    tags: ["science", "ai", "future"],
    author: "Ray Kurzweil",
    image: "/garden/books/singularity-is-nearer.jpg",
    imageAlt: "Cover of The Singularity Is Nearer by Ray Kurzweil",
    externalUrl: "https://www.goodreads.com/book/show/45024007-the-singularity-is-nearer",
    externalLabel: "Goodreads",
    body:
      "I picked this up because the work I do every day stopped feeling like \"someday\" fiction. I ship with Claude Code, wire agents to paid APIs, watch builders demo things on Spaces that would have taken a team eighteen months ago. Kurzweil's whole pitch is that the curve is the story, not the gadgets. Reading it now hits different than reading it five years back.\n\n" +
      "What actually lands for me is the frame, not the date-stamping. He treats software, biology, and cognition as the same kind of compounding stack. I do not need to buy every timeline on the cover to find that useful. It matches what I see in the ecosystem: one person with the right tools and a clear problem can ship a mini-app, a game, an API, and have it live before the conversation about it is over.\n\n" +
      "The honest part: prediction is a track record game, and track records are messy. I am not reading this as prophecy. I am reading it as a way to stay oriented while the floor keeps moving. If you build with AI, or you are trying to figure out what agents are actually good for, this is worth the time. I am still in it. More notes when I finish.",
  },
  {
    id: "book-black-swan",
    kinds: ["reading"],
    title: "The Black Swan",
    summary: "Taleb on the outsized role of rare, unpredictable events, and our blindness to them.",
    tags: ["science", "probability", "risk", "uncertainty"],
    author: "Nassim Nicholas Taleb",
    image: "/garden/books/black-swan.jpg",
    imageAlt: "Cover of The Black Swan by Nassim Nicholas Taleb",
    externalUrl: "https://www.goodreads.com/book/show/28226413-the-black-swan",
    externalLabel: "Goodreads",
  },
  {
    id: "book-algorithms-to-live-by",
    kinds: ["reading"],
    title: "Algorithms to Live By",
    summary: "Christian and Griffiths on computer science as a guide to human decisions.",
    tags: ["science", "computation", "decision-making"],
    author: "Brian Christian & Tom Griffiths",
    image: "/garden/books/algorithms-to-live-by.jpg",
    imageAlt: "Cover of Algorithms to Live By by Brian Christian and Tom Griffiths",
    externalUrl: "https://www.goodreads.com/book/show/31925009-summary-of-algorithms-to-live-by",
    externalLabel: "Goodreads",
  },
  {
    id: "book-origin-of-species",
    kinds: ["reading"],
    title: "The Origin of Species and The Voyage of the Beagle",
    summary: "Darwin's voyage and the theory that came out of it.",
    tags: ["science", "biology", "evolution"],
    author: "Charles Darwin",
    image: "/garden/books/origin-of-species.jpg",
    imageAlt: "Cover of The Origin of Species by Charles Darwin",
    externalUrl: "https://www.goodreads.com/book/show/32331601-the-origin-of-species",
    externalLabel: "Goodreads",
  },

  /* philosophy */
  {
    id: "book-critique-of-pure-reason",
    kinds: ["reading"],
    title: "The Critique of Pure Reason",
    summary: "Kant on what reason can and cannot know about the world.",
    tags: ["philosophy", "epistemology", "kant"],
    author: "Immanuel Kant",
    image: "/garden/books/critique-of-pure-reason.jpg",
    imageAlt: "Cover of The Critique of Pure Reason by Immanuel Kant",
    externalUrl: "https://www.goodreads.com/book/show/51851032-the-critique-of-pure-reason",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-prophet",
    kinds: ["reading"],
    title: "The Prophet",
    summary: "Gibran's prose poems on love, work, freedom and the rest of life.",
    tags: ["philosophy", "poetry", "spirituality"],
    author: "Kahlil Gibran",
    image: "/garden/books/the-prophet.jpg",
    imageAlt: "Cover of The Prophet by Kahlil Gibran",
    externalUrl: "https://www.goodreads.com/book/show/223160115-the-prophet-by-kahlil-gibran",
    externalLabel: "Goodreads",
  },
  {
    id: "book-nausea",
    kinds: ["reading"],
    title: "Nausea",
    summary: "Sartre's novel of existence, freedom and the strangeness of just being here.",
    tags: ["philosophy", "existentialism", "fiction", "sartre"],
    author: "Jean-Paul Sartre",
    image: "/garden/books/nausea.jpg",
    imageAlt: "Cover of Nausea by Jean-Paul Sartre",
    externalUrl: "https://www.goodreads.com/book/show/298275.Nausea",
    externalLabel: "Goodreads",
  },

  /* money, business, tech */
  {
    id: "book-richest-man-in-babylon",
    kinds: ["reading"],
    title: "The Richest Man in Babylon",
    summary: "Clason's old parables on saving, debt and building wealth slowly.",
    tags: ["money", "personal-finance"],
    author: "George S. Clason",
    image: "/garden/books/richest-man-in-babylon.jpg",
    imageAlt: "Cover of The Richest Man in Babylon by George S. Clason",
    externalUrl: "https://www.goodreads.com/book/show/8516889-the-richest-man-in-babylon",
    externalLabel: "Goodreads",
  },
  {
    id: "book-wealth-of-nations",
    kinds: ["reading"],
    title: "The Wealth of Nations",
    summary: "Adam Smith's founding text of modern economics.",
    tags: ["money", "economics", "classics"],
    author: "Adam Smith",
    image: "/garden/books/wealth-of-nations.jpg",
    imageAlt: "Cover of The Wealth of Nations by Adam Smith",
    externalUrl: "https://www.goodreads.com/book/show/28241997-the-wealth-of-nations",
    externalLabel: "Goodreads",
  },
  {
    id: "book-capital",
    kinds: ["reading"],
    title: "Capital",
    summary: "Marx's critique of political economy and the workings of capital.",
    tags: ["money", "economics", "politics", "classics"],
    author: "Karl Marx",
    image: "/garden/books/capital.jpg",
    imageAlt: "Cover of Capital by Karl Marx",
    externalUrl: "https://www.goodreads.com/book/show/34394704-o-capital---karl-marx",
    externalLabel: "Goodreads",
  },
  {
    id: "book-ascent-of-money",
    kinds: ["reading"],
    title: "The Ascent of Money",
    summary: "Ferguson's financial history of the world, from coins to credit crises.",
    tags: ["money", "economics", "history", "finance"],
    author: "Niall Ferguson",
    image: "/garden/books/ascent-of-money.jpg",
    imageAlt: "Cover of The Ascent of Money by Niall Ferguson",
    externalUrl: "https://www.goodreads.com/book/show/2714607-the-ascent-of-money",
    externalLabel: "Goodreads",
  },
  {
    id: "book-almanack-of-naval",
    kinds: ["reading"],
    title: "The Almanack of Naval Ravikant",
    summary: "Jorgenson's collection of Naval on wealth, leverage and happiness.",
    tags: ["money", "startups", "philosophy", "leverage"],
    author: "Eric Jorgenson",
    image: "/garden/books/almanack-of-naval.jpg",
    imageAlt: "Cover of The Almanack of Naval Ravikant by Eric Jorgenson",
    externalUrl: "https://www.goodreads.com/book/show/121105473-the-almanack-of-naval-ravikant-by-eric-jorgenson-tools-of-titans-by-tim",
    externalLabel: "Goodreads",
  },
  {
    id: "book-zero-to-one",
    kinds: ["reading"],
    title: "Zero to One",
    summary: "Thiel on building the new instead of copying what already works.",
    tags: ["startups", "tech", "building"],
    author: "Peter Thiel",
    image: "/garden/books/zero-to-one.jpg",
    imageAlt: "Cover of Zero to One by Peter Thiel",
    externalUrl: "https://www.goodreads.com/book/show/31703274-zero-to-one",
    externalLabel: "Goodreads",
  },
  {
    id: "book-same-as-ever",
    kinds: ["reading"],
    title: "Same as Ever",
    summary: "Housel on the things about people and risk that never change.",
    tags: ["money", "behaviour", "investing"],
    author: "Morgan Housel",
    image: "/garden/books/same-as-ever.jpg",
    imageAlt: "Cover of Same as Ever by Morgan Housel",
    externalUrl: "https://www.goodreads.com/book/show/125116554-same-as-ever",
    externalLabel: "Goodreads",
  },
  {
    id: "book-read-write-own",
    kinds: ["reading"],
    title: "Read Write Own",
    summary: "Chris Dixon's case for the next era of the internet, built on blockchains.",
    tags: ["crypto", "tech", "building", "blockchain"],
    author: "Chris Dixon",
    image: "/garden/books/read-write-own.jpg",
    imageAlt: "Read Write Own by Chris Dixon",
    externalUrl: "https://www.goodreads.com/book/show/178628338-read-write-own",
    externalLabel: "Goodreads",
    links: ["gladaitors", "farcaster-intel-api", "based-games", "borrowed-laptop"],
  },
  {
    id: "book-hard-thing-about-hard-things",
    kinds: ["reading"],
    title: "The Hard Thing About Hard Things",
    summary: "Horowitz on the parts of running a company that nobody can prepare you for.",
    tags: ["startups", "tech", "building", "leadership"],
    author: "Ben Horowitz",
    image: "/garden/books/hard-thing-about-hard-things.jpg",
    imageAlt: "Cover of The Hard Thing About Hard Things by Ben Horowitz",
    externalUrl: "https://www.goodreads.com/book/show/24687652-the-hard-thing-about-hard-things-ben-horowitz---review-summary",
    externalLabel: "Goodreads",
  },

  /* history & politics */
  {
    id: "book-sapiens",
    kinds: ["reading"],
    title: "Sapiens",
    summary: "Harari's sweep through the history of our species, from foragers to today.",
    tags: ["history", "anthropology", "harari"],
    author: "Yuval Noah Harari",
    image: "/garden/books/sapiens.jpg",
    imageAlt: "Cover of Sapiens by Yuval Noah Harari",
    externalUrl: "https://www.goodreads.com/book/show/26054257-sapiens",
    externalLabel: "Goodreads",
  },
  {
    id: "book-nexus",
    kinds: ["reading"],
    title: "Nexus",
    summary: "Harari on information networks, from stone tablets to AI, and who controls them.",
    tags: ["history", "ai", "networks", "harari", "tech"],
    author: "Yuval Noah Harari",
    image: "/garden/books/nexus.jpg",
    imageAlt: "Cover of Nexus by Yuval Noah Harari",
    externalUrl: "https://www.goodreads.com/book/show/204927599-nexus",
    externalLabel: "Goodreads",
    links: ["gladaitors", "farcaster-intel-api"],
  },
  {
    id: "book-silk-roads",
    kinds: ["reading"],
    title: "The Silk Roads",
    summary: "Frankopan retells world history with the East, not the West, at the centre.",
    tags: ["history", "trade", "asia"],
    author: "Peter Frankopan",
    image: "/garden/books/silk-roads.jpg",
    imageAlt: "Cover of The Silk Roads by Peter Frankopan",
    externalUrl: "https://www.goodreads.com/book/show/25812847-the-silk-roads",
    externalLabel: "Goodreads",
  },
  {
    id: "book-two-treatises-of-government",
    kinds: ["reading"],
    title: "Two Treatises of Government",
    summary: "Locke on natural rights, property and the limits of government.",
    tags: ["politics", "philosophy", "classics", "locke"],
    author: "John Locke",
    image: "/garden/books/two-treatises-of-government.jpg",
    imageAlt: "Cover of Two Treatises of Government by John Locke",
    externalUrl: "https://www.goodreads.com/book/show/53353109-the-first-and-second-treatises-of-government-by-john-locke",
    externalLabel: "Goodreads",
  },
  {
    id: "book-train-to-pakistan",
    kinds: ["reading"],
    title: "Train to Pakistan",
    summary: "Khushwant Singh's novel of a village torn apart by Partition.",
    tags: ["history", "india", "partition", "fiction"],
    author: "Khushwant Singh",
    image: "/garden/books/train-to-pakistan.jpg",
    imageAlt: "Cover of Train to Pakistan by Khushwant Singh",
    externalUrl: "https://www.goodreads.com/book/show/785454.Train_to_Pakistan",
    externalLabel: "Goodreads",
  },
  {
    id: "book-mein-kampf",
    kinds: ["reading"],
    title: "Mein Kampf",
    summary: "Hitler's manifesto, read to understand how the ideology was built.",
    tags: ["history", "politics", "primary-source"],
    author: "Adolf Hitler",
    image: "/garden/books/mein-kampf.jpg",
    imageAlt: "Cover of Mein Kampf by Adolf Hitler",
    externalUrl: "https://www.goodreads.com/book/show/210151814-mein-kampf-da-adolf-hitler",
    externalLabel: "Goodreads",
  },
  {
    id: "book-gandhi-autobiography",
    kinds: ["reading"],
    title: "An Autobiography: The Story of My Experiments with Truth",
    summary: "Gandhi's own account of his life and his experiments with truth.",
    tags: ["history", "india", "biography", "philosophy"],
    author: "M.K. Gandhi",
    image: "/garden/books/gandhi-autobiography.jpg",
    imageAlt: "An Autobiography: The Story of My Experiments with Truth by M.K. Gandhi",
    externalUrl: "https://www.goodreads.com/book/show/153275883-an-autobiography-or-the-story-of-my-experiments-with-truth-by-mk-gandhi",
    externalLabel: "Goodreads",
  },
  {
    id: "book-autobiography-malcolm-x",
    kinds: ["reading"],
    title: "The Autobiography of Malcolm X",
    summary: "Malcolm X's life, as told to Alex Haley.",
    tags: ["history", "biography", "politics", "race"],
    author: "Malcolm X with Alex Haley",
    image: "/garden/books/autobiography-malcolm-x.jpg",
    imageAlt: "Cover of The Autobiography of Malcolm X",
    externalUrl: "https://www.goodreads.com/book/show/131779119-the-autobiography-of-malcolm-x",
    externalLabel: "Goodreads",
  },
  {
    id: "book-marx-returns",
    kinds: ["reading"],
    title: "Marx Returns",
    summary: "Jason Barker's novel imagining Marx wrestling with Capital and his own life.",
    tags: ["fiction", "politics", "philosophy", "marx"],
    author: "Jason Barker",
    image: "/garden/books/marx-returns.jpg",
    imageAlt: "Marx Returns by Jason Barker",
    externalUrl: "https://www.goodreads.com/book/show/36963930-marx-returns",
    externalLabel: "Goodreads",
  },

  /* fiction & literature */
  {
    id: "book-demons",
    kinds: ["reading"],
    title: "Demons",
    summary: "Dostoevsky's novel of revolutionaries, nihilism and a town coming undone.",
    tags: ["fiction", "literature", "russian", "dostoevsky"],
    author: "Fyodor Dostoevsky",
    image: "/garden/books/demons.jpg",
    imageAlt: "Cover of Demons by Fyodor Dostoevsky",
    externalUrl: "https://www.goodreads.com/book/show/5695.Demons",
    externalLabel: "Goodreads",
  },
  {
    id: "book-brothers-karamazov",
    kinds: ["reading"],
    favorite: true,
    title: "The Brothers Karamazov",
    summary: "Dostoevsky's last novel: faith, doubt, family and a murder.",
    tags: ["fiction", "literature", "russian", "dostoevsky"],
    author: "Fyodor Dostoevsky",
    image: "/garden/books/brothers-karamazov.jpg",
    imageAlt: "Cover of The Brothers Karamazov by Fyodor Dostoevsky",
    externalUrl: "https://www.goodreads.com/book/show/236301336-the-brothers-karamazov",
    externalLabel: "Goodreads",
  },
  {
    id: "book-war-and-peace",
    kinds: ["reading"],
    title: "War and Peace",
    summary: "Tolstoy's epic of Russian families through the Napoleonic wars. KP read this one on a Goa beach, between shifts.",
    tags: ["fiction", "literature", "russian", "tolstoy", "goa"],
    author: "Leo Tolstoy",
    image: "/garden/books/war-and-peace.jpg",
    imageAlt: "Cover of War and Peace by Leo Tolstoy",
    externalUrl: "https://www.goodreads.com/book/show/34742912-war-and-peace-by-leo-tolstoy",
    externalLabel: "Goodreads",
    links: ["fresh2o"],
  },
  {
    id: "book-anna-karenina",
    kinds: ["reading"],
    title: "Anna Karenina",
    summary: "Tolstoy on love, marriage and society in imperial Russia.",
    tags: ["fiction", "literature", "russian", "tolstoy"],
    author: "Leo Tolstoy",
    image: "/garden/books/anna-karenina.jpg",
    imageAlt: "Cover of Anna Karenina by Leo Tolstoy",
    externalUrl: "https://www.goodreads.com/book/show/62074658-anna-karenina",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-iliad",
    kinds: ["reading"],
    title: "The Iliad",
    summary: "Homer's war poem, in Caroline Alexander's translation.",
    tags: ["fiction", "literature", "classics", "epic"],
    author: "Homer, translated by Caroline Alexander",
    image: "/garden/books/the-iliad.jpg",
    imageAlt: "Cover of The Iliad by Homer",
    externalUrl: "https://www.goodreads.com/book/show/23460877-the-iliad",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-odyssey",
    kinds: ["reading"],
    favorite: true,
    title: "The Odyssey",
    summary: "Homer's long way home from the war at Troy.",
    tags: ["fiction", "literature", "classics", "epic"],
    author: "Homer",
    image: "/garden/books/the-odyssey.jpg",
    imageAlt: "Cover of The Odyssey by Homer",
    externalUrl: "https://www.goodreads.com/book/show/1381.The_Odyssey",
    externalLabel: "Goodreads",
  },
  {
    id: "book-ulysses",
    kinds: ["reading"],
    title: "Ulysses",
    summary: "Joyce's one Dublin day, told every way a novel can be told.",
    tags: ["fiction", "literature", "modernism", "joyce"],
    author: "James Joyce",
    image: "/garden/books/ulysses.jpg",
    imageAlt: "Cover of Ulysses by James Joyce",
    externalUrl: "https://www.goodreads.com/book/show/338798.Ulysses",
    externalLabel: "Goodreads",
  },
  {
    id: "book-labyrinths",
    kinds: ["reading"],
    title: "Labyrinths",
    summary: "Borges' stories and essays on infinity, mirrors and impossible libraries.",
    tags: ["fiction", "literature", "borges", "short-stories"],
    author: "Jorge Luis Borges",
    image: "/garden/books/labyrinths.jpg",
    imageAlt: "Cover of Labyrinths by Jorge Luis Borges",
    externalUrl: "https://www.goodreads.com/book/show/17717.Labyrinths",
    externalLabel: "Goodreads",
  },
  {
    id: "book-to-kill-a-mockingbird",
    kinds: ["reading"],
    title: "To Kill a Mockingbird",
    summary: "Harper Lee on justice and childhood in the American South.",
    tags: ["fiction", "literature", "race", "classics"],
    author: "Harper Lee",
    image: "/garden/books/to-kill-a-mockingbird.jpg",
    imageAlt: "Cover of To Kill a Mockingbird by Harper Lee",
    externalUrl: "https://www.goodreads.com/book/show/26189532-to-kill-a-mockingbird-by-harper-lee-summary-analysis",
    externalLabel: "Goodreads",
  },
  {
    id: "book-tale-of-two-cities",
    kinds: ["reading"],
    title: "A Tale of Two Cities",
    summary: "Dickens on London, Paris and the French Revolution.",
    tags: ["fiction", "literature", "history", "classics"],
    author: "Charles Dickens",
    image: "/garden/books/tale-of-two-cities.jpg",
    imageAlt: "Cover of A Tale of Two Cities by Charles Dickens",
    externalUrl: "https://www.goodreads.com/book/show/34332722-great-expectations",
    externalLabel: "Goodreads",
  },
  {
    id: "book-mountain-shadow",
    kinds: ["reading"],
    title: "The Mountain Shadow",
    summary: "Gregory David Roberts' sequel to Shantaram, back in the Bombay underworld.",
    tags: ["fiction", "literature", "india"],
    author: "Gregory David Roberts",
    image: "/garden/books/mountain-shadow.jpg",
    imageAlt: "Cover of The Mountain Shadow by Gregory David Roberts",
    externalUrl: "https://www.goodreads.com/book/show/126006558-the-mountain-shadow-by-gregory-david-roberts",
    externalLabel: "Goodreads",
  },
  {
    id: "book-hitchhikers-guide",
    kinds: ["reading"],
    title: "The Hitchhiker's Guide to the Galaxy: The Complete Collection",
    summary: "Douglas Adams' whole increasingly inaccurately named trilogy, in one volume.",
    tags: ["fiction", "literature", "sci-fi", "comedy"],
    author: "Douglas Adams",
    image: "/garden/books/hitchhikers-guide.jpg",
    imageAlt: "Cover of The Hitchhiker's Guide to the Galaxy by Douglas Adams",
    externalUrl: "https://www.goodreads.com/book/show/37928547-hitchhiker-s-guide-to-the-galaxy-complete-set---douglas-adams-collection",
    externalLabel: "Goodreads",
  },
  {
    id: "book-watchmen",
    kinds: ["reading"],
    title: "Watchmen",
    summary: "Moore and Gibbons' graphic novel that asked what real superheroes would be like.",
    tags: ["fiction", "literature", "graphic", "comics"],
    author: "Alan Moore & Dave Gibbons",
    image: "/garden/books/watchmen.jpg",
    imageAlt: "Cover of Watchmen by Alan Moore and Dave Gibbons",
    externalUrl: "https://www.goodreads.com/book/show/472331.Watchmen",
    externalLabel: "Goodreads",
  },
  {
    id: "book-fish-in-alien-streams",
    kinds: ["reading"],
    title: "A Fish in Alien Streams",
    summary: "Herjinder's collection, picked up off the beaten path.",
    tags: ["fiction", "literature", "india"],
    author: "Herjinder",
    image: "",
    imageAlt: "A Fish in Alien Streams by Herjinder",
    externalUrl: "https://www.goodreads.com/book/show/59078371-a-fish-in-alien-streams",
    externalLabel: "Goodreads",
  },
  {
    id: "book-life-keith-richards",
    kinds: ["reading"],
    title: "Life",
    summary: "Keith Richards' memoir of the Rolling Stones and surviving most of it.",
    tags: ["biography", "music", "memoir"],
    author: "Keith Richards",
    image: "/garden/books/life-keith-richards.jpg",
    imageAlt: "Cover of Life by Keith Richards",
    externalUrl: "https://www.goodreads.com/book/show/9439303-life",
    externalLabel: "Goodreads",
  },

  /* shelf adds (KP, 2026-06-17) */
  {
    id: "book-crime-and-punishment",
    kinds: ["reading"],
    title: "Crime and Punishment",
    summary: "Dostoevsky's novel of guilt, conscience and redemption in St Petersburg.",
    tags: ["fiction", "literature", "philosophy", "classics", "dostoevsky"],
    author: "Fyodor Dostoevsky",
    image: "/garden/books/crime-and-punishment.jpg",
    imageAlt: "Crime and Punishment by Fyodor Dostoevsky",
    externalUrl: "https://www.goodreads.com/book/show/46117596-crime-and-punishment",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-idiot",
    kinds: ["reading"],
    title: "The Idiot",
    summary: "Dostoevsky's story of a pure soul dropped into the cruelty of high society.",
    tags: ["fiction", "literature", "philosophy", "classics", "dostoevsky"],
    author: "Fyodor Dostoevsky",
    image: "/garden/books/the-idiot.jpg",
    imageAlt: "The Idiot by Fyodor Dostoevsky",
    externalUrl: "https://www.goodreads.com/book/show/53123010-the-idiot-by-fyodor-dostoevsky",
    externalLabel: "Goodreads",
  },
  {
    id: "book-in-search-of-schrodingers-cat",
    kinds: ["reading"],
    readStatus: "to-read",
    title: "In Search of Schrödinger's Cat",
    summary: "Gribbin's popular tour of quantum physics and what it actually means.",
    tags: ["science", "physics", "quantum"],
    author: "John Gribbin",
    image: "/garden/books/in-search-of-schrodingers-cat.jpg",
    imageAlt: "In Search of Schrödinger's Cat by John Gribbin",
    externalUrl: "https://www.goodreads.com/book/show/513367.In_Search_of_Schr_dinger_s_Cat",
    externalLabel: "Goodreads",
  },
  {
    id: "book-to-explain-the-world",
    kinds: ["reading"],
    readStatus: "half-read",
    title: "To Explain the World",
    summary: "Weinberg on how modern science learned to explain nature.",
    tags: ["science", "history-of-science", "physics"],
    author: "Steven Weinberg",
    image: "/garden/books/to-explain-the-world.jpg",
    imageAlt: "To Explain the World by Steven Weinberg",
    externalUrl: "https://www.goodreads.com/book/show/22328555-to-explain-the-world",
    externalLabel: "Goodreads",
  },
  {
    id: "book-consciousness-explained",
    kinds: ["reading"],
    title: "Consciousness Explained",
    summary: "Dennett's attempt to demystify consciousness without a ghost in the machine.",
    tags: ["philosophy", "science", "minds"],
    author: "Daniel C. Dennett",
    image: "/garden/books/consciousness-explained.jpg",
    imageAlt: "Consciousness Explained by Daniel C. Dennett",
    externalUrl: "https://www.goodreads.com/book/show/128454543-consciousness-explained-by-daniel-c-dennett",
    externalLabel: "Goodreads",
  },
  {
    id: "book-beyond-good-and-evil",
    kinds: ["reading"],
    readStatus: "half-read",
    title: "Beyond Good and Evil",
    summary: "Nietzsche's aphorisms on morality, truth and the will to power.",
    tags: ["philosophy", "classics", "nietzsche"],
    author: "Friedrich Nietzsche",
    image: "/garden/books/beyond-good-and-evil.jpg",
    imageAlt: "Beyond Good and Evil by Friedrich Nietzsche",
    externalUrl: "https://www.goodreads.com/book/show/33651446-beyond-good-and-evil",
    externalLabel: "Goodreads",
  },
  {
    id: "book-thinking-fast-and-slow",
    kinds: ["reading"],
    readStatus: "half-read",
    title: "Thinking, Fast and Slow",
    summary: "Kahneman on the two systems that drive how we think and decide.",
    tags: ["science", "psychology", "decision-making"],
    author: "Daniel Kahneman",
    image: "/garden/books/thinking-fast-and-slow.jpg",
    imageAlt: "Thinking, Fast and Slow by Daniel Kahneman",
    externalUrl: "https://www.goodreads.com/book/show/17185950-thinking-fast-and-slow-by-daniel-kahneman",
    externalLabel: "Goodreads",
  },
  {
    id: "book-siddhartha",
    kinds: ["reading"],
    title: "Siddhartha",
    summary: "Hesse's novel of a young man's search for meaning on the banks of the river.",
    tags: ["fiction", "literature", "philosophy", "spirituality"],
    author: "Hermann Hesse",
    image: "/garden/books/siddhartha.jpg",
    imageAlt: "Siddhartha by Hermann Hesse",
    externalUrl: "https://www.goodreads.com/book/show/60487534-siddhartha-by-hermann-hesse",
    externalLabel: "Goodreads",
  },
  {
    id: "book-in-search-of-lost-time-vol-1",
    kinds: ["reading"],
    readStatus: "half-read",
    title: "In Search of Lost Time, Volume 1: Swann's Way",
    summary: "Proust opens his epic with memory, desire and the world of the Faubourg.",
    tags: ["fiction", "literature", "classics"],
    author: "Marcel Proust",
    image: "/garden/books/in-search-of-lost-time-vol-1.jpg",
    imageAlt: "In Search of Lost Time, Volume 1: Swann's Way by Marcel Proust",
    externalUrl: "https://www.goodreads.com/book/show/18803.In_Search_of_Lost_Time_Volume_1",
    externalLabel: "Goodreads",
  },

  /* more reading (batch 2, KP-confirmed) */
  {
    id: "book-the-fountainhead",
    kinds: ["reading"],
    title: "The Fountainhead",
    summary: "Rand's novel of an architect who will not compromise his vision for anyone.",
    tags: ["fiction", "literature", "philosophy", "individualism"],
    author: "Ayn Rand",
    image: "/garden/books/the-fountainhead.jpg",
    imageAlt: "Cover of The Fountainhead by Ayn Rand",
    externalUrl: "https://www.goodreads.com/book/show/2122.The_Fountainhead",
    externalLabel: "Goodreads",
  },
  {
    id: "book-thus-spoke-zarathustra",
    kinds: ["reading"],
    title: "Thus Spoke Zarathustra",
    summary: "Nietzsche's philosophical novel on the overman, eternal recurrence and the death of god.",
    tags: ["philosophy", "classics", "nietzsche"],
    author: "Friedrich Nietzsche",
    image: "/garden/books/thus-spoke-zarathustra.jpg",
    imageAlt: "Cover of Thus Spoke Zarathustra by Friedrich Nietzsche",
    externalUrl: "https://www.goodreads.com/book/show/239262372-thus-spoke-zarathustra---by-friedrich-nietzsche",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-trial",
    kinds: ["reading"],
    title: "The Trial",
    summary: "Kafka's nightmare of a man arrested and prosecuted by an authority that never names his crime.",
    tags: ["fiction", "literature", "philosophy", "kafka"],
    author: "Franz Kafka",
    image: "/garden/books/the-trial.jpg",
    imageAlt: "Cover of The Trial by Franz Kafka",
    externalUrl: "https://www.goodreads.com/book/show/6874976-the-trial-by-franz-kafka-and-the-metamorphosis-by-franz-kafka",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-metamorphosis",
    kinds: ["reading"],
    title: "The Metamorphosis",
    summary: "Kafka's tale of a man who wakes one morning transformed into an insect.",
    tags: ["fiction", "literature", "kafka"],
    author: "Franz Kafka",
    image: "/garden/books/the-metamorphosis.jpg",
    imageAlt: "Cover of The Metamorphosis by Franz Kafka",
    externalUrl: "https://www.goodreads.com/book/show/198387408-the-metamorphosis",
    externalLabel: "Goodreads",
  },
  {
    id: "book-rights-of-man",
    kinds: ["reading"],
    title: "Rights of Man",
    summary: "Paine's defence of the French Revolution and the case for natural rights and republican government.",
    tags: ["politics", "philosophy", "classics"],
    author: "Thomas Paine",
    image: "/garden/books/rights-of-man.jpg",
    imageAlt: "Cover of Rights of Man by Thomas Paine",
    externalUrl: "https://www.goodreads.com/book/show/34061011-the-rights-of-man",
    externalLabel: "Goodreads",
  },
  {
    id: "book-the-art-of-war",
    kinds: ["reading"],
    title: "The Art of War",
    summary: "Sun Tzu's ancient treatise on strategy, conflict and winning without fighting.",
    tags: ["philosophy", "strategy", "classics"],
    author: "Sun Tzu",
    image: "/garden/books/the-art-of-war.jpg",
    imageAlt: "Cover of The Art of War by Sun Tzu",
    externalUrl: "https://www.goodreads.com/book/show/2587.The_Art_of_War_Sun_Tzu_s_Classic_in_Plain_English_With_Sun_Pin_s_",
    externalLabel: "Goodreads",
  },
  {
    id: "book-new-history-of-the-world",
    kinds: ["reading"],
    title: "A New History of the World",
    summary: "Roberts' single-volume sweep of human history from prehistory to the modern age.",
    tags: ["history"],
    author: "J. M. Roberts",
    image: "/garden/books/new-history-of-the-world.jpg",
    imageAlt: "Cover of A New History of the World by J. M. Roberts",
    externalUrl: "https://www.goodreads.com/book/show/61617023-the-illustrated-history-of-the-world",
    externalLabel: "Goodreads",
  },
  {
    id: "book-irrationally-rational",
    kinds: ["reading"],
    title: "Irrationally Rational",
    summary: "Raghunathan on the everyday biases and irrationalities that drive how we actually decide.",
    tags: ["business", "behavioural-economics"],
    author: "V. Raghunathan",
    image: "/garden/books/irrationally-rational.jpg",
    imageAlt: "Cover of Irrationally Rational by V. Raghunathan",
    externalUrl: "https://www.goodreads.com/book/show/61486532-irrationally-rational",
    externalLabel: "Goodreads",
  },

  /* ---------- hobbies ---------- */
  {
    id: "hobby-chess",
    kinds: ["hobby"],
    title: "Chess",
    summary:
      "Chess is a constant. It also became a show: I play a guest while we talk crypto.",
    tags: ["chess", "community"],
    links: ["live-stream"],
    body: "PLACEHOLDER: a few lines about chess and photos.",
    image: "/images/hobby_chess_knight.jpg",
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
  {
    id: "hobby-movies",
    kinds: ["hobby"],
    title: "Movies",
    summary: "Films I keep coming back to. Notes and stills to come.",
    tags: ["movies", "film"],
    body: "PLACEHOLDER: movie notes and photos.",
    image: "",
    imageAlt: "PLACEHOLDER movies photo",
  },

  /* ---------- story ----------
     Cinematic vertical chapters. One strong photo per beat,
     ordered by `chapter`. Some story beats double as project
     nodes (fresh2o, goa-hostel above). */
  {
    id: "story-lucknow",
    kinds: ["story"],
    title: "A lot of deep ends",
    summary:
      "Graduation in Economics, then a decade of being thrown into the deep end.",
    tags: ["economics", "finance", "origin"],
    chapter: 1,
    era: "2009 - 2018",
    body:
      "After Graduation in Economics, a decade of deep ends: QuickBooks support at IBM, self-taught forex and stock trading, an investment-advisor stint at Angel Broking, selling websites for a fucked up firm and coordinating US trucking dispatch and accounts remotely from India. I learned to operate where nobody hands you a manual.",
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
  {
    id: "pepper",
    kinds: ["story"],
    title: "Pepper",
    summary:
      "Pepper came into life when my wife found him on street, scared and hungry.",
    tags: ["pet","animals"],
    chapter: 6,
    era: "2021",
    links: ["delhi", "family"],
    body:
      "to be added.",
    image: "/images/story-pepper1.jpg",
    imageAlt: "Pepper posing for the camera",
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
