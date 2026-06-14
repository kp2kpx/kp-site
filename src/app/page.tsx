import Reveal from "./Reveal";
import { SiteNav, SiteFooter, MobileSectionBar } from "./components/Chrome";
import { GardenCard } from "./components/GardenCard";
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

/* A home cell: a real node id plus the grid span classes that
   place it. Order matters; it is the visual reading order. */
type Cell = { id: string; span: string };

const HOME_CELLS: Cell[] = [
  { id: "hobby-trekking", span: "c2 r2" },        // top-right tall climb/trek photo
  { id: "gladaitors", span: "c2" },               // project (text, live mini-app)
  { id: "book-beginning-of-infinity", span: "c2" }, // book
  { id: "himalayas", span: "c4 r2" },             // wide story photo
  { id: "farcaster-intel-api", span: "c2" },      // project (text)
  { id: "why-i-host-the-spaces", span: "c4" },    // blog excerpt
  { id: "book-fabric-of-reality", span: "c2" },   // book
  { id: "fresh2o", span: "c2 r2" },               // tall story/project photo
  { id: "story-cyclone", span: "c4" },            // wide story photo
];

export default function Home() {
  const nodes = getGardenNodes();
  const cells = HOME_CELLS.map((c) => {
    const node = getNode(nodes, c.id);
    return node ? { node, span: c.span } : null;
  }).filter((x): x is { node: GardenNode; span: string } => Boolean(x));

  return (
    <main>
      <SiteNav />
      <MobileSectionBar />

      <div className="mx-auto w-full max-w-[1080px] px-8 pt-24 sm:pt-28">
        <section className="garden-grid">
          {/* INTRO occupies the top-left cell (4 cols x 2 rows) */}
          <div className="intro-cell">
            <Reveal>
              <h1>
                Hey there, I&apos;m KP{" "}
                <span style={{ fontStyle: "normal" }}>&#128075;</span>
                <br />
                <span className="wave">Welcome to my digital garden</span>{" "}
                &#127793;
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p>
                A quiet place I tend over time. Things I&apos;m building,
                reading, climbing, and thinking about. No feed, no algorithm.
                Just what I felt like keeping.
              </p>
            </Reveal>
          </div>

          {cells.map(({ node, span }) => (
            <GardenCard key={node.id} node={node} className={span} />
          ))}
        </section>

        <footer className="garden-footer">
          <span className="sprout">&#127793;</span> Planted by KP
        </footer>
      </div>

      <SiteFooter />
    </main>
  );
}
