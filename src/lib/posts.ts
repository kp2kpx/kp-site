/* ============================================================
   Build-time markdown blog loader.
   Reads .md / .mdx files from content/posts, parses frontmatter
   with gray-matter, renders the body to HTML with marked.
   Everything here runs ONLY at build time (static export), so
   node:fs usage is safe and the output is plain HTML for IPFS.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { NODES, type GardenNode } from "./garden";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  /* Optional explicit links to other garden nodes, set in the
     post frontmatter as `links: ["fresh2o", ...]`. */
  links: string[];
};

export type Post = PostMeta & {
  html: string;
};

function readDir(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function fileToSlug(file: string): string {
  return file.replace(/\.mdx?$/, "");
}

/* Human-readable date, no dashes in the rendered string. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = fileToSlug(file);
  const html = marked.parse(content, { async: false }) as string;
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    date: typeof data.date === "string" ? data.date : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    links: Array.isArray(data.links) ? (data.links as string[]) : [],
    html,
  };
}

/* All posts, newest first. */
export function getAllPosts(): Post[] {
  return readDir()
    .map(parseFile)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map((p) => {
    const { html, ...meta } = p;
    void html;
    return meta;
  });
}

export function getPostSlugs(): string[] {
  return readDir().map(fileToSlug);
}

export function getPostBySlug(slug: string): Post | null {
  const file = readDir().find((f) => fileToSlug(f) === slug);
  if (!file) return null;
  return parseFile(file);
}

/* ============================================================
   THE GRAPH, assembled.

   getGardenNodes() returns the full node list: the hand-authored
   NODES plus one `writing` node per markdown post. Every page
   that touches the graph (sections, detail pages, related links)
   should source nodes from here, not from NODES directly, so that
   blog posts participate in tags and backlinks like everything
   else. Writing detail pages still render the markdown body via
   getPostBySlug; the node carries the metadata and links.
   ============================================================ */
function postToNode(p: PostMeta): GardenNode {
  return {
    id: p.slug,
    kinds: ["writing"],
    title: p.title,
    summary: p.excerpt,
    tags: p.tags,
    date: p.date,
    sortDate: p.date,
    links: p.links,
  };
}

export function getGardenNodes(): GardenNode[] {
  const writingNodes = getAllPostMeta().map(postToNode);
  return [...NODES, ...writingNodes];
}
