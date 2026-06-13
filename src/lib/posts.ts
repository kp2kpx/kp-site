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

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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
