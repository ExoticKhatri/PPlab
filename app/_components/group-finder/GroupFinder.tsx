"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getGroupResearch } from "../ad-research/research-registry";
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

type SortKey = "reach" | "count" | "pay" | "need" | "share";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

const SORT_OPTIONS: { key: SortKey; label: string; defaultDir: SortDir }[] = [
  { key: "share", label: "Share needed", defaultDir: "asc" },
  { key: "reach", label: "Reach", defaultDir: "desc" },
  { key: "count", label: "Bodies", defaultDir: "desc" },
  { key: "pay", label: "Pay / mo", defaultDir: "desc" },
  { key: "need", label: "Need", defaultDir: "asc" },
];

function sortValue(group: Group, region: Region, key: SortKey): number {
  const market = group[region];
  switch (key) {
    case "reach":
      return market.reach;
    case "count":
      return market.count;
    case "pay":
      return market.payPerMonth;
    case "need":
      return customersNeeded(market, region);
    case "share":
      return shareNeeded(market, region);
  }
}

function shareTone(share: number): string {
  if (share <= 0.03) return "bg-emerald-400";
  if (share <= 0.1) return "bg-amber-400";
  return "bg-rose-400";
}

function StepsPanel() {
  return (
    <aside className="hidden h-full w-64 shrink-0 p-4 md:block">
      <ol className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-white/2 p-5">
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
  const analysed = getGroupResearch(group.id) !== null;
  const market = group[region];
  const share = shareNeeded(market, region);
  const need = customersNeeded(market, region).toLocaleString(region === "india" ? "en-IN" : "en-US");
  const name = (
    <>
      <span className="mr-2 inline-block w-2 text-white/25 transition group-hover/row:translate-x-0.5 group-hover/row:text-white">›</span>
      {group.name}
      {analysed && <span className="ml-2 text-[10px] tracking-wide text-white/35 uppercase">· analysed</span>}
      {market.sourced && <span className="ml-1.5 text-[10px] text-emerald-300/70">●</span>}
    </>
  );
  const shareBar = (
    <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${shareTone(share)}`}
        style={{ width: `${Math.min(100, Math.max(4, share * 400))}%` }}
      />
    </div>
  );

  return (
    <li className="border-b border-white/5 px-1 py-3.5">
      <Link href={`/groups/${group.id}`} title={group.source ?? "Estimate"} className="group/row block w-full text-left">
      {/* Mobile: name + share on top, compact stat line below */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-white/90">{name}</p>
          <div className="flex shrink-0 items-center gap-2">
            {shareBar}
            <span className="text-xs text-white/50 tabular-nums">{formatShare(share)}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs tabular-nums">
          <ReachDots score={market.reach} />
          <span className="text-sky-200">{formatCount(market.count, region)}</span>
          <span className="text-white/15">·</span>
          <span className="text-violet-200">
            {formatMoney(market.payPerMonth, region)}
            <span className="text-white/30">/mo</span>
          </span>
          <span className="text-white/15">·</span>
          <span className="text-amber-200">
            <span className="text-white/30">need </span>
            {need}
          </span>
        </div>
      </div>

      {/* Desktop: table row */}
      <div className={`hidden items-center gap-x-4 sm:grid ${COLUMNS}`}>
        <p className="truncate text-sm text-white/90">{name}</p>
        <div className="flex justify-end">
          <ReachDots score={market.reach} />
        </div>
        <p className="text-right text-sm text-sky-200 tabular-nums">{formatCount(market.count, region)}</p>
        <p className="text-right text-sm text-violet-200 tabular-nums">{formatMoney(market.payPerMonth, region)}</p>
        <p className="text-right text-sm text-amber-200 tabular-nums">{need}</p>
        <div className="flex items-center justify-end gap-2">
          {shareBar}
          <span className="w-16 text-right text-xs text-white/50 tabular-nums">{formatShare(share)}</span>
        </div>
      </div>
      </Link>
    </li>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center justify-end gap-1 ${active ? "text-white/70" : "text-white/30 hover:text-white/50"}`}
    >
      <span className="text-[9px]">{active ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
      {label}
    </button>
  );
}

export default function GroupFinder() {
  const [region, setRegion] = useState<Region>("india");
  const [sort, setSort] = useState<SortState>({ key: "share", dir: "asc" });

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: SORT_OPTIONS.find((o) => o.key === key)!.defaultDir };
    });
  };

  const groups = useMemo(() => {
    const dirMul = sort.dir === "asc" ? 1 : -1;
    return [...GROUPS].sort((a, b) => dirMul * (sortValue(a, region, sort.key) - sortValue(b, region, sort.key)));
  }, [region, sort]);

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

          {/* Mobile: sort dropdown */}
          <div className="mt-3 flex items-center gap-2 sm:hidden">
            <span className="text-[10px] tracking-wide text-white/30 uppercase">Sort by</span>
            <select
              value={sort.key}
              onChange={(e) => handleSort(e.target.value as SortKey)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-[#05070f]">
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSort((prev) => ({ ...prev, dir: prev.dir === "asc" ? "desc" : "asc" }))}
              className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/50"
            >
              {sort.dir === "asc" ? "▲ low→high" : "▼ high→low"}
            </button>
          </div>

          <div className={`mt-4 hidden gap-x-4 sm:grid ${COLUMNS} px-1 text-[10px] tracking-wide uppercase`}>
            <span className="text-white/30">Group</span>
            <SortHeader label="Reach" sortKey="reach" sort={sort} onSort={handleSort} />
            <SortHeader label="Bodies" sortKey="count" sort={sort} onSort={handleSort} />
            <SortHeader label="Pay / mo" sortKey="pay" sort={sort} onSort={handleSort} />
            <SortHeader label="Need" sortKey="need" sort={sort} onSort={handleSort} />
            <SortHeader label="Share needed" sortKey="share" sort={sort} onSort={handleSort} />
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
