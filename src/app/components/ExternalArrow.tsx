import { ArrowUpRight } from "./icons";

/* Corner arrow for tiles that link out. Internal tile hit stays on-site;
   this is the only outbound affordance. cursor: alias via globals.css. */
export function ExternalArrow({
  url,
  ariaLabel = "Open external link",
  hoverLabel,
  onPhoto,
  className = "",
}: {
  url: string;
  ariaLabel?: string;
  hoverLabel?: string;
  onPhoto?: boolean;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`arrow tile-external-arrow${onPhoto ? " on-photo" : ""}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <ArrowUpRight />
      {hoverLabel ? (
        <span className="tile-external-arrow__label">{hoverLabel}</span>
      ) : null}
    </a>
  );
}

export function externalHoverLabel(node: {
  kinds: string[];
  externalUrl?: string;
  externalLabel?: string;
}): string | undefined {
  if (!node.externalUrl) return undefined;
  if (node.kinds[0] === "reading") return "view on goodreads";
  if (node.externalUrl.includes("paragraph.com")) return "view on paragraph";
  if (node.externalLabel) return node.externalLabel.toLowerCase();
  return undefined;
}