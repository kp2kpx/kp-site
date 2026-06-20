import type { Metadata } from "next";
import { SectionShell } from "../components/SectionShell";
import { NodeCard } from "../components/NodeCard";
import { getGardenNodes } from "@/lib/posts";
import { byKind } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Hobbies, KP",
  description: "Chess, trekking, music, and the rest of what KP does off the keyboard.",
};

export default function HobbiesPage() {
  const nodes = getGardenNodes();
  const hobbies = byKind(nodes, "hobby");

  return (
    <SectionShell
      current="/hobbies/"
      eyebrow="Hobbies"
      title="Off the keyboard"
      intro="Chess, trekking, music. Photos to come."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hobbies.map((n, i) => (
          <NodeCard key={n.id} node={n} delay={(i % 3) * 60} />
        ))}
      </div>
    </SectionShell>
  );
}
