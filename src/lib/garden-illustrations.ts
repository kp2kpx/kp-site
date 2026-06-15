/** Minimal garden SVG variants (warm paper palette). One per top-level site area. */
export const GARDEN_ILLUSTRATIONS = {
  home: "/garden/garden-minimal-02.svg",
  cv: "/garden/garden-minimal-01.svg",
  story: "/garden/garden-minimal-03.svg",
  projects: "/garden/garden-minimal-04.svg",
  hobbies: "/garden/garden-minimal-05.svg",
  reading: "/garden/garden-minimal-06.svg",
  writing: "/garden/garden-minimal-07.svg",
  articles: "/garden/garden-minimal-08.svg",
  writingPost: "/garden/garden-minimal-09.svg",
  projectDetail: "/garden/garden-minimal-10.svg",
} as const;

export type GardenIllustrationKey = keyof typeof GARDEN_ILLUSTRATIONS;

/** Longest prefix first so /writing/slug beats /writing. */
const PATH_RULES: { prefix: string; key: GardenIllustrationKey }[] = [
  { prefix: "/writing/", key: "writingPost" },
  { prefix: "/projects/", key: "projectDetail" },
  { prefix: "/articles/", key: "articles" },
  { prefix: "/story/", key: "story" },
  { prefix: "/hobbies/", key: "hobbies" },
  { prefix: "/reading/", key: "reading" },
  { prefix: "/cv", key: "cv" },
  { prefix: "/story", key: "story" },
  { prefix: "/projects", key: "projects" },
  { prefix: "/hobbies", key: "hobbies" },
  { prefix: "/reading", key: "reading" },
  { prefix: "/writing", key: "writing" },
  { prefix: "/articles", key: "articles" },
  { prefix: "/", key: "home" },
];

export function getGardenIllustrationForPath(pathname: string): string {
  const path = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  for (const { prefix, key } of PATH_RULES) {
    if (prefix === "/") {
      if (path === "/" || path === "") return GARDEN_ILLUSTRATIONS.home;
      continue;
    }
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return GARDEN_ILLUSTRATIONS[key];
    }
  }

  return GARDEN_ILLUSTRATIONS.home;
}

export const showMeadowBackground =
  process.env.NEXT_PUBLIC_GARDEN_BG !== "0";