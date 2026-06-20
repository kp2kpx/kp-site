/* One-time (re-runnable) import of @kpx Paragraph posts into content/posts.

   Fetches public RSS, converts HTML bodies to markdown, hotlinks images.
   Run: node scripts/import-paragraph.mjs

   No em or en dashes in this file (house style). */
import fs from "node:fs";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")),
  "..",
);
const POSTS_DIR = path.join(ROOT, "content", "posts");
const RSS_URL = "https://api.paragraph.com/blogs/rss/@kpx";

function slugFromLink(link) {
  const u = new URL(link);
  const parts = u.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "post";
}

function isoDate(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function yamlQuote(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    emDelimiter: "*",
    codeBlockStyle: "fenced",
  });

  td.addRule("paragraphEmbed", {
    filter: (node) =>
      node.nodeName === "DIV" &&
      node.getAttribute?.("data-type") === "embedly",
    replacement: (_content, node) => {
      const anchor = node.querySelector?.("a[href]");
      const href = anchor?.getAttribute("href");
      const title =
        anchor?.querySelector("h2")?.textContent?.trim() ||
        anchor?.textContent?.trim()?.split("\n")[0] ||
        "Embedded link";
      if (!href) return "";
      return `\n\n[${title}](${href})\n\n`;
    },
  });

  td.addRule("figureImage", {
    filter: (node) => node.nodeName === "FIGURE" && !!node.querySelector?.("img"),
    replacement: (_content, node) => {
      const img = node.querySelector("img");
      const src = img?.getAttribute("src");
      if (!src) return "";
      const alt = img?.getAttribute("alt")?.trim() || "";
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  td.addRule("standaloneImage", {
    filter: (node) => {
      if (node.nodeName !== "IMG") return false;
      const parent = node.parentElement;
      return !parent || parent.nodeName !== "FIGURE";
    },
    replacement: (_content, node) => {
      const src = node.getAttribute("src");
      if (!src) return "";
      const alt = node.getAttribute("alt")?.trim() || "";
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  return td;
}

function htmlToMarkdown(html, td) {
  const cleaned = html
    .replace(/blurdataurl="[^"]*"/gi, "")
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, "")
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br>");
  let md = td.turndown(cleaned);
  md = md
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return md;
}

async function main() {
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    cdataPropName: "__cdata",
    processEntities: true,
  });
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel;
  const rawItems = channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  if (items.length === 0) throw new Error("No RSS items found");

  const td = buildTurndown();
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const written = [];
  for (const item of items) {
    const title = item.title?.__cdata ?? item.title ?? "Untitled";
    const link = item.link ?? "";
    const pubDate = item.pubDate ?? "";
    const description =
      item.description?.__cdata ?? item.description ?? "";
    const encoded =
      item["content:encoded"]?.__cdata ??
      item["content:encoded"] ??
      "";

    const slug = slugFromLink(link);
    const date = isoDate(pubDate);
    const excerpt = stripHtml(description).slice(0, 280);
    const body = htmlToMarkdown(encoded || description, td);

    const frontmatter = [
      "---",
      `title: ${yamlQuote(title)}`,
      `date: ${yamlQuote(date)}`,
      `excerpt: ${yamlQuote(excerpt)}`,
      `tags: ["writing"]`,
      `source: ${yamlQuote(link)}`,
      "---",
      "",
    ].join("\n");

    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, `${frontmatter}${body}\n`, "utf8");
    written.push({ slug, title, date, link });
  }

  console.log(`Imported ${written.length} posts to content/posts/:`);
  for (const w of written) {
    console.log(`  - ${w.slug}.md  (${w.date})  ${w.title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});