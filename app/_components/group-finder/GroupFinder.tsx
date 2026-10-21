"use client";

import { useMemo, useState } from "react";
import type { Group, Region } from "./group-data";
import {
  GROUPS,
  REGIONS,
  STEPS,
  customersNeeded,
  formatCount,
  formatMoney,
  formatShare,
  shareNeeded,
} from "./group-data";

const REGION_IDS: Region[] = ["india", "global"];

function shareTone(share: number): string {
  if (share <= 0.03) return "bg-emerald-400";
  if (share <= 0.1) return "bg-amber-400";
  return "bg-rose-400";
}

function StepsPanel() {
  return (
    <aside className="hidden h-full w-64 shrink-0 p-4 md:block">
      <ol className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {STEPS.map((step) => (
          <li key={step.n}>
            <span className="font-mono text-[11px] text-white/30">0{step.n}</span>
            <p className="text-sm font-medium text-white/90">{step.title}</p>
            <p className="mt-0.5 text-xs leading-snug text-white/40">{step.body}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}

const COLUMNS = "sm:grid-cols-[1fr_4.5rem_4.5rem_4.5rem_4.5rem_8.5rem]";

function ReachDots({ score }: { score: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Reach ${score} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 w-1.5 rounded-full ${n <= score ? "bg-emerald-300" : "bg-white/10"}`} />
      ))}
    </span>
  );
}

function GroupRow({ group, region }: { group: Group; region: Region }) {
  const market = group[region];
  const share = shareNeeded(market, region);

  return (
    <li
      title={market.sourced ? group.source : "Estimate"}
      className={`grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-x-4 gap-y-2 border-b border-white/5 px-1 py-3.5 ${COLUMNS}`}
    >
      <p className="col-span-4 truncate text-sm text-white/90 sm:col-span-1">
        {group.name}
        {market.sourced && <span className="ml-1.5 text-[10px] text-emerald-300/70">●</span>}
      </p>
      <div className="sm:flex sm:justify-end">
        <ReachDots score={market.reach} />
      </div>
      <p className="text-sm text-sky-200 tabular-nums sm:text-right">{formatCount(market.count, region)}</p>
      <p className="text-sm text-violet-200 tabular-nums sm:text-right">{formatMoney(market.payPerMonth, region)}</p>
      <p className="text-sm text-amber-200 tabular-nums sm:text-right">
        {customersNeeded(market, region).toLocaleString(region === "india" ? "en-IN" : "en-US")}
      </p>
      <div className="col-span-4 flex items-center justify-end gap-2 sm:col-span-1">
        <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${shareTone(share)}`}
            style={{ width: `${Math.min(100, Math.max(4, share * 400))}%` }}
          />
        </div>
        <span className="w-16 text-right text-xs text-white/50 tabular-nums">{formatShare(share)}</span>
      </div>
    </li>
  );
}

export default function GroupFinder() {
  const [region, setRegion] = useState<Region>("india");
  const groups = useMemo(
    () => [...GROUPS].sort((a, b) => shareNeeded(a[region], region) - shareNeeded(b[region], region)),
    [region],
  );

  return (
    <div className="flex h-full w-full bg-[#05070f] text-white">
      <StepsPanel />

      <section className="h-full min-w-0 flex-1 overflow-y-auto px-4 pb-28 md:pr-8 md:pl-4">
        <div className="sticky top-0 z-10 -mx-1 bg-[#05070f] px-1 pt-6 pb-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              Target {formatMoney(REGIONS[region].targetPerYear, region)} / yr
            </p>
            <div className="flex rounded-full border border-white/10 p-0.5">
              {REGION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRegion(id)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    region === id ? "bg-white text-black" : "text-white/50 hover:text-white"
                  }`}
                >
                  {REGIONS[id].label}
                </button>
              ))}
            </div>
          </div>
          <div className={`mt-4 hidden gap-x-4 sm:grid ${COLUMNS} px-1 text-[10px] tracking-wide text-white/30 uppercase`}>
            <span>Group</span>
            <span className="text-right">Reach</span>
            <span className="text-right">Bodies</span>
            <span className="text-right">Pay / mo</span>
            <span className="text-right">Need</span>
            <span className="text-right">Share needed</span>
          </div>
        </div>

        <ul>
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} region={region} />
          ))}
        </ul>

        <p className="mt-4 text-[11px] text-white/25">
          <span className="text-emerald-300/70">●</span> sourced count. Everything else is an estimate.
        </p>
      </section>
    </div>
  );
}
