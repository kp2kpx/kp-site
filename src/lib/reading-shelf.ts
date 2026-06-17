import type { GardenNode } from "./garden";

export type BookBadgeStatus = "reading" | "half-read" | "to-read" | "read";

const BOOK_BADGE_LABEL: Record<BookBadgeStatus, string> = {
  reading: "Reading",
  "half-read": "Half read",
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

export type ShelfSortMode = "status" | "genre";

const STATUS_GROUPS: { id: BookBadgeStatus; label: string }[] = [
  { id: "reading", label: "Reading" },
  { id: "half-read", label: "Half read" },
  { id: "to-read", label: "To read" },
  { id: "read", label: "Read" },
];

export const BOOK_GENRE_ORDER = [
  { id: "science", label: "Science & physics", shortLabel: "Science", tags: ["science"] },
  { id: "philosophy", label: "Philosophy", shortLabel: "Philosophy", tags: ["philosophy"] },
  {
    id: "money",
    label: "Money, business & tech",
    shortLabel: "Money",
    tags: ["money", "startups", "business", "crypto"],
  },
  { id: "history", label: "History & politics", shortLabel: "History", tags: ["history", "politics"] },
  { id: "fiction", label: "Fiction & literature", shortLabel: "Fiction", tags: ["fiction", "literature"] },
  { id: "biography", label: "Biography & memoir", shortLabel: "Bio", tags: ["biography"] },
  { id: "religion", label: "Religion & spirituality", shortLabel: "Religion", tags: ["religion", "spirituality"] },
  { id: "other", label: "Other", shortLabel: "Other", tags: [] as string[] },
] as const;

export type BookGenreId = (typeof BOOK_GENRE_ORDER)[number]["id"];

export function bookGenre(node: GardenNode): BookGenreId {
  for (const genre of BOOK_GENRE_ORDER) {
    if (genre.id === "other") continue;
    if (genre.tags.some((tag) => node.tags.includes(tag))) return genre.id;
  }
  return "other";
}

export function genreLabel(id: BookGenreId): string {
  return BOOK_GENRE_ORDER.find((g) => g.id === id)?.label ?? "Other";
}

export type ShelfGroup = {
  id: string;
  label: string;
  books: GardenNode[];
};

function titleSort(a: GardenNode, b: GardenNode): number {
  return a.title.localeCompare(b.title);
}

export function groupBooksByStatus(books: GardenNode[]): ShelfGroup[] {
  const buckets = new Map<BookBadgeStatus, GardenNode[]>();
  for (const status of STATUS_GROUPS) buckets.set(status.id, []);

  for (const book of books) {
    const { cls } = bookBadge(book);
    buckets.get(cls)?.push(book);
  }

  return STATUS_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    books: (buckets.get(group.id) ?? []).sort(titleSort),
  })).filter((group) => group.books.length > 0);
}

export function groupBooksByGenre(books: GardenNode[]): ShelfGroup[] {
  const buckets = new Map<BookGenreId, GardenNode[]>();
  for (const genre of BOOK_GENRE_ORDER) buckets.set(genre.id, []);

  for (const book of books) {
    const genre = bookGenre(book);
    buckets.get(genre)?.push(book);
  }

  return BOOK_GENRE_ORDER.map((genre) => ({
    id: genre.id,
    label: genre.label,
    books: (buckets.get(genre.id) ?? []).sort(titleSort),
  })).filter((group) => group.books.length > 0);
}

export function sortBooks(books: GardenNode[], mode: ShelfSortMode): ShelfGroup[] {
  return mode === "status" ? groupBooksByStatus(books) : groupBooksByGenre(books);
}

/* Stable pseudo-random order (same seed = same shuffle at build time). */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffleBooks(books: GardenNode[], seed: string): GardenNode[] {
  const out = [...books];
  let state = hashSeed(seed);
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function booksCurrentlyReading(books: GardenNode[]): GardenNode[] {
  return books.filter((book) => book.readStatus === "reading");
}

export function booksFavorites(books: GardenNode[]): GardenNode[] {
  return books.filter((book) => book.favorite);
}