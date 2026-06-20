import type { Metadata } from "next";
import { SiteNav, SiteFooter, MobileSectionBar, Container } from "../components/Chrome";
import { ReadingShelf } from "../components/ReadingShelf";
import { getGardenNodes } from "@/lib/posts";
import { byKind } from "@/lib/garden";
import { shuffleBooks } from "@/lib/reading-shelf";

export const metadata: Metadata = {
  title: "Reading, KP",
  description: "Books KP has read, is reading, or has queued. Tap a cover for the page and KP's take if he has one.",
};

/* Chester-style shelf: section label once, then a 4-column grid of
   horizontal book cards (cover left, badge + title + author right). */
export default function ReadingPage() {
  const books = shuffleBooks(byKind(getGardenNodes(), "reading"), "kp-reading-shelf");

  return (
    <main>
      <SiteNav current="/reading/" />
      <MobileSectionBar current="/reading/" />

      <div className="reading-page">
        <Container className="max-w-[1080px] px-8 pt-[5.75rem] pb-16 sm:pt-[4.75rem]">
          <ReadingShelf books={books} />
        </Container>
      </div>

      <SiteFooter />
    </main>
  );
}