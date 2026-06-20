import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NodeDetail } from "../../components/NodeDetail";
import { getGardenNodes } from "@/lib/posts";
import { byKind, getNode, relatedNodes } from "@/lib/garden";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return byKind(getGardenNodes(), "hobby").map((n) => ({ id: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const node = getNode(getGardenNodes(), id);
  if (!node) return { title: "Not found, KP" };
  return { title: `${node.title}, KP`, description: node.summary };
}

export default async function HobbyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const nodes = getGardenNodes();
  const node = getNode(nodes, id);
  if (!node || !node.kinds.includes("hobby")) notFound();

  return (
    <NodeDetail
      node={node}
      related={relatedNodes(nodes, node)}
      current="/hobbies/"
      backHref="/hobbies/"
      backLabel="All hobbies"
    />
  );
}
