import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AdResearch from "../../_components/ad-research/AdResearch";
import { getGroupResearch } from "../../_components/ad-research/research-registry";
import type { Group, Region } from "../../_components/group-finder/group-data";
import {
  GROUPS,
  REGIONS,
  customersNeeded,
  formatCount,
  formatMoney,
  formatShare,
  shareNeeded,
} from "../../_components/group-finder/group-data";

const REGION_IDS: Region[] = ["india", "global"];

export function generateStaticParams(): { id: string }[] {
  return GROUPS.map((group) => ({ id: group.id }));
}

export default function GroupPage({ params }: PageProps<"/groups/[id]">) {
  // params is URL data: read it inside Suspense so the route shell stays instant.
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#05070f]" />}>
      <GroupContent params={params} />
    </Suspense>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-wide text-white/30 uppercase">{label}</p>
      <p className={`mt-0.5 text-sm tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

function RegionStats({ group, region }: { group: Group; region: Region }) {
  const market = group[region];
  const locale = region === "india" ? "en-IN" : "en-US";
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <p className="text-xs text-white/50">
        {REGIONS[region].label}
        <span className="text-white/25"> · target {formatMoney(REGIONS[region].targetPerYear, region)}/yr</span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5">
        <Stat label="Bodies" value={formatCount(market.count, region)} tone="text-sky-200" />
        <Stat label="Pay / mo" value={formatMoney(market.payPerMonth, region)} tone="text-violet-200" />
        <Stat label="Reach" value={`${market.reach}/5`} />
        <Stat label="Need" value={customersNeeded(market, region).toLocaleString(locale)} tone="text-amber-200" />
        <Stat label="Share needed" value={formatShare(shareNeeded(market, region))} />
      </div>
    </div>
  );
}

async function GroupContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = GROUPS.find((g) => g.id === id);
  if (!group) notFound();
  const research = getGroupResearch(group.id);

  const header = (
    <header className="mb-8 border-b border-white/5 pb-6">
      <Link href="/?tab=groups" className="text-xs text-white/40 transition hover:text-white">
        ← Group finder
      </Link>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{group.name}</h1>
      {group.source ? <p className="mt-2 text-xs leading-relaxed text-white/35">{group.source}</p> : null}
      <div className="mt-5 grid gap-3">
        {REGION_IDS.map((region) => (
          <RegionStats key={region} group={group} region={region} />
        ))}
      </div>
    </header>
  );

  return (
    <div className="fixed inset-0">
      {research ? (
        <AdResearch research={research} header={header} />
      ) : (
        <div className="h-full w-full overflow-y-auto bg-[#05070f] px-4 pt-8 pb-28 sm:px-8">
          <div className="mx-auto max-w-4xl">
            {header}
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-white/60">No data available yet</p>
              <p className="mt-1 text-xs text-white/30">
                This group hasn&apos;t been analysed on Meta ads, Play Store or YouTube yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
