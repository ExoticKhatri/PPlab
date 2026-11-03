import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DETAILS } from "../../_components/idea-detail/details";
import IdeaDetailView from "../../_components/idea-detail/IdeaDetailView";
import { IDEAS } from "../../_components/idea-list/idea-data";

export function generateStaticParams(): { id: string }[] {
  return IDEAS.map((idea) => ({ id: idea.id }));
}

export default function IdeaPage({ params }: PageProps<"/ideas/[id]">) {
  // params is URL data: read it inside Suspense so the route shell stays instant.
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#07080a]" />}>
      <IdeaContent params={params} />
    </Suspense>
  );
}

async function IdeaContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = IDEAS.find((i) => i.id === id);
  if (!idea) notFound();
  return (
    <div className="fixed inset-0">
      <IdeaDetailView idea={idea} detail={DETAILS[idea.id]} />
    </div>
  );
}
