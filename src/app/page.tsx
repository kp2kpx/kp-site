import { GardenHome } from "./components/GardenHome";
import { getGardenNodes } from "@/lib/posts";
import { getNode, type GardenNode } from "@/lib/garden";

/* ============================================================
   HOME (the KP garden front door). Chester-style structured
   grid in the warm paper palette. The intro block is the
   top-left grid cell; real garden nodes flow around it as
   photo / project / book / text cards, each with a category
   eyebrow and a corner arrow that solidifies on hover.

   The grid is a CURATED hand-placed selection (not the raw
   recent feed) so spans compose like the mockup: tall photos
   span two rows, wide cards span more columns. Every node is
   pulled from the real garden graph; nothing here is a
   placeholder. Layout is restyling only, the node model and
   routes are untouched.

   "KP" only here. Full name appears solely on the CV page.
   ============================================================ */

type Cell = { id: string; span: string };

const HOME_CELLS: Cell[] = [
  { id: "hobby-trekking", span: "c2 r2" },
  { id: "himalayas", span: "c4 r2" },
  { id: "fresh2o", span: "c2 r2" },
  { id: "gladaitors", span: "c2" },
  { id: "farcaster-intel-api", span: "c2" },
  { id: "book-beginning-of-infinity", span: "c2" },
  { id: "why-i-host-the-spaces", span: "c4" },
  { id: "book-fabric-of-reality", span: "c2" },
  { id: "story-cyclone", span: "c6" },
];

export default function Home() {
  const nodes = getGardenNodes();
  const cells = HOME_CELLS.map((c) => {
    const node = getNode(nodes, c.id);
    return node ? { node, span: c.span } : null;
  }).filter((x): x is { node: GardenNode; span: string } => Boolean(x));

  return <GardenHome cells={cells} />;
}