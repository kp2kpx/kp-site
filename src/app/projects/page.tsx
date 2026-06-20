import type { Metadata } from "next";
import { SectionShell } from "../components/SectionShell";
import { NodeCard } from "../components/NodeCard";
import { getGardenNodes } from "@/lib/posts";
import { byKind } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Projects, KP",
  description:
    "Everything KP has made, past and present, software and not: cafes, hostels, open mics, and onchain products.",
};

export default function ProjectsPage() {
  const nodes = getGardenNodes();
  const projects = byKind(nodes, "project");

  return (
    <SectionShell
      current="/projects/"
      eyebrow="Projects"
      title="Things I made"
      intro="Past and present, software and not. A cafe I built by hand, a hostel, open mics, and onchain products. Some of these are also chapters of the story."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((n, i) => (
          <NodeCard key={n.id} node={n} delay={(i % 3) * 60} />
        ))}
      </div>
    </SectionShell>
  );
}
