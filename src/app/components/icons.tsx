/* ============================================================
   Social / door-out icons for the top-right nav.
   Plain inline SVGs (no icon dependency), currentColor so the
   visual layer controls colour. Sized via the `className` prop.
   ============================================================ */

type IconProps = { className?: string };

/* Farcaster arch mark. */
export function FarcasterIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      aria-hidden
      fill="currentColor"
      className={className}
    >
      <path d="M257 155h486v98H257zM217 253h80v592h-80zM703 253h80v592h-80zM177 253h80v98h-80zM743 253h80v98h-80zM297 253h406v60H297z" />
      <path d="M257 155h486v98H257zM207 253h120v98H207zM673 253h120v98h-120zM297 351h406v494h-90V450H387v395h-90z" />
    </svg>
  );
}

/* X (Twitter) mark. */
export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* Diagonal up-right arrow used in the corner of every garden
   card. Stroke (currentColor) so the card hover can invert it
   inside the filled circle. Path matches the garden-v2 spec. */
export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

/* GitHub mark. */
export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56v-2.2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.5.12-3.12 0 0 1-.31 3.3 1.2a11.6 11.6 0 0 1 6 0c2.3-1.51 3.3-1.2 3.3-1.2.65 1.62.24 2.82.12 3.12.77.82 1.23 1.87 1.23 3.15 0 4.5-2.81 5.48-5.49 5.78.43.36.81 1.08.81 2.18v3.23c0 .31.21.68.82.56A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}
