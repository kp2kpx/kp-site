import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NodeDetail } from "../../components/NodeDetail";
import { getGardenNodes } from "@/lib/posts";
import { byKind, getNode, relatedNodes } from "@/lib/garden";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return byKind(getGardenNodes(), "reading").map((n) => ({ id: n.id }));
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

/* Each book its OWN little page. Holds KP's take only if the
   node carries `takeaway`; otherwise it is simply on the shelf. */
export default async function BookDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const nodes = getGardenNodes();
  const node = getNode(nodes, id);
  if (!node || !node.kinds.includes("reading")) notFound();

  return (
    <NodeDetail
      node={node}
      related={relatedNodes(nodes, node)}
      current="/reading/"
      backHref="/reading/"
      backLabel="The shelf"
    />
  );
}
