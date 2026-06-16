import type { Metadata } from "next";
import Reveal from "../Reveal";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "../components/Chrome";
import { GardenCard, bookBadge } from "../components/GardenCard";
import { getGardenNodes } from "@/lib/posts";
import { byKind, type GardenNode } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Reading, KP",
  description: "Books KP has read, is reading, or has queued. Tap a cover for the page and KP's take if he has one.",
};

function shelfOrder(node: GardenNode): number {
  const { cls } = bookBadge(node);
  if (cls === "reading") return 0;
  if (cls === "to-read") return 1;
  return 2;
}

/* Chester-style shelf: section label once, then a 4-column grid of
   horizontal book cards (cover left, badge + title + author right). */
export default function ReadingPage() {
  const books = byKind(getGardenNodes(), "reading").sort(
    (a, b) => shelfOrder(a) - shelfOrder(b) || a.title.localeCompare(b.title)
  );

  return (
    <main>
      <SiteNav current="/reading/" />
      <MobileSectionBar current="/reading/" />

      <div className="reading-page">
        <Container className="max-w-[1080px] px-8 pt-[5.75rem] pb-16 sm:pt-[4.75rem]">
          <Reveal>
            <div className="reading-page__label">
              Reading &middot; <b>Books</b>
              <span className="reading-page__chev" aria-hidden>
                {" "}
                &rsaquo;
              </span>
            </div>
          </Reveal>

          <div className="reading-shelf">
            {books.map((book, i) => (
              <div key={book.id} className="reading-shelf__cell">
                <Reveal delay={(i % 4) * 40} className="reading-shelf__reveal">
                  <GardenCard node={book} shelf />
                </Reveal>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <SiteFooter />
    </main>
  );
}