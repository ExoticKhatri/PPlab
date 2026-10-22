import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import AdResearch from "../../_components/ad-research/AdResearch";
import type { Group, GroupIdea } from "../../_components/group-finder/group-data";
import { GROUPS } from "../../_components/group-finder/group-data";

type AnalysisPage = (props: { header: ReactNode }) => ReactNode;

// Each idea with a full analysis page. Ideas without an entry show "analysis pending".
const ANALYSES: Record<string, AnalysisPage> = {
  "k12-school-ops": AdResearch,
};

function findIdea(slug: string): { group: Group; idea: GroupIdea } | null {
  for (const group of GROUPS) {
    const idea = group.ideas?.find((i) => i.slug === slug);
    if (idea) return { group, idea };
  }
  return null;
}

export function generateStaticParams(): { slug: string }[] {
  return GROUPS.flatMap((g) => g.ideas ?? []).map((i) => ({ slug: i.slug }));
}

export default function IdeaPage({ params }: PageProps<"/ideas/[slug]">) {
  // params is URL data: read it inside Suspense so the route shell stays instant.
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#05070f]" />}>
      <IdeaContent params={params} />
    </Suspense>
  );
}

async function IdeaContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findIdea(slug);
  if (!found) notFound();
  const { group, idea } = found;
  const Analysis = ANALYSES[slug];

  const header = (
    <header className="mb-8 border-b border-white/5 pb-6">
      <Link href="/?tab=groups" className="text-xs text-white/40 transition hover:text-white">
        ← Group finder
      </Link>
      <p className="mt-5 text-xs text-white/40">{group.name}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{idea.title}</h1>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
        <span>
          Ease to build <b className="text-white">{idea.easeToBuild}/5</b>
        </span>
        <span>
          Will pay <b className="text-violet-200">₹{idea.payPerMonth.toLocaleString("en-IN")}</b>/mo
        </span>
        <span className="rounded-full border border-amber-400/30 px-2 py-0.5 text-amber-200/80">{idea.status}</span>
      </div>
      <p className="mt-3 text-sm text-white/60">{idea.note}</p>
    </header>
  );

  return (
    <div className="fixed inset-0">
      {Analysis ? (
        <Analysis header={header} />
      ) : (
        <div className="h-full w-full overflow-y-auto bg-[#05070f] px-4 pt-8 sm:px-8">
          <div className="mx-auto max-w-4xl">
            {header}
            <p className="text-sm text-white/40">Analysis pending.</p>
          </div>
        </div>
      )}
    </div>
  );
}
