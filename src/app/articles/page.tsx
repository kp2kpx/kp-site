import type { Metadata } from "next";
import Link from "next/link";
import { RedirectTo } from "../components/RedirectTo";

/* /articles is superseded by /writing. Keep the old URL alive
   for existing links: redirect to /writing on the client (static
   export safe) and offer a manual link as a fallback. */
export const metadata: Metadata = {
  title: "Writing, KP",
  description: "Moved to /writing.",
};

export default function ArticlesIndexRedirect() {
  return (
    <RedirectTo to="/writing/">
      <Link href="/writing/">Go to Writing</Link>
    </RedirectTo>
  );
}
