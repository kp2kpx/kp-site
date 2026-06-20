import { GardenHome } from "./components/GardenHome";
import { getGardenNodes } from "@/lib/posts";
import { byKind, getNode, type GardenNode } from "@/lib/garden";
import { booksFavorites, shuffleBooks } from "@/lib/reading-shelf";

const HOME_FAVORITE_COUNT = 3;

/* ============================================================
   HOME (the KP garden front door). Chester-style structured
   grid in the warm paper palette. The intro block is the
   top-left grid cell; real garden nodes flow around it as
   photo / project / book / text cards, each with a category
   eyebrow and a corner arrow that solidifies on hover.

   Three book tiles are shuffled picks from favorite: true
   nodes. Everything else on /reading/.

   "KP" only here. Full name appears solely on the CV page.
   ============================================================ */

type HomeSlot =
  | { kind: "node"; id: string; span: string }
  | { kind: "favorite"; span: string };

const HOME_LAYOUT: HomeSlot[] = [
  { kind: "node", id: "hobby-trekking", span: "c2 r2" },
  { kind: "node", id: "himalayas", span: "c4 r2" },
  { kind: "node", id: "fresh2o", span: "c2 r2" },
  { kind: "node", id: "gladaitors", span: "c2" },
  { kind: "favorite", span: "c2" },
  { kind: "favorite", span: "c2" },
  { kind: "node", id: "poetical-science", span: "c4" },
  { kind: "favorite", span: "c2" },
  { kind: "node", id: "story-cyclone", span: "c6" },
];

function buildHomeCells(nodes: GardenNode[]) {
  const favoriteQueue = shuffleBooks(
    booksFavorites(byKind(nodes, "reading")),
    "kp-home-favorites",
  ).slice(0, HOME_FAVORITE_COUNT);
  const cells: { node: GardenNode; span: string }[] = [];

  for (const slot of HOME_LAYOUT) {
    if (slot.kind === "favorite") {
      const book = favoriteQueue.shift();
      if (book) cells.push({ node: book, span: slot.span });
      continue;
    }
    const node = getNode(nodes, slot.id);
    if (node) cells.push({ node, span: slot.span });
  }

  return cells;
}

export default function Home() {
  const cells = buildHomeCells(getGardenNodes());
  return <GardenHome cells={cells} />;
}