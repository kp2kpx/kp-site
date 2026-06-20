"use client";

import { useEffect } from "react";

/* Client-side redirect that works under static export (no server
   redirects on IPFS). Replaces the current history entry so the
   old URL does not trap the back button, and renders a manual
   link fallback for no-JS / crawler cases. */
export function RedirectTo({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <p className="font-[family-name:var(--font-mono)] text-[14px] text-(--color-ink-dim)">
        {children}
      </p>
    </main>
  );
}
