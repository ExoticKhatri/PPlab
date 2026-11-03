"use client";

import { useMemo, useState } from "react";
import { customersFor, formatInr } from "../idea-guide/guide-data";
import type { Idea, Level } from "./idea-data";
import { IDEAS, scoreOf, shareNeeded, WEIGHTS } from "./idea-data";

type SortKey = "score" | "ticket" | "build" | "bodies" | "marketing" | "competitors";

// First click on a column shows the best ideas first, so "better" sets the direction.
const COLUMNS: { key: SortKey; label: string; better: "high" | "low" }[] = [
  { key: "ticket", label: "Ticket / month", better: "high" },
  { key: "build", label: "Build difficulty", better: "low" },
  { key: "bodies", label: "Businesses", better: "high" },
  { key: "marketing", label: "Marketing difficulty", better: "low" },
  { key: "competitors", label: "Competitors", better: "low" },
  { key: "score", label: "Score", better: "high" },
];

const LEVEL_WORD: Record<Level, string> = { 1: "Easy", 2: "Fairly easy", 3: "Medium", 4: "Hard", 5: "Very hard" };
const LEVEL_TONE: Record<Level, string> = { 1: "bg-emerald-400", 2: "bg-emerald-300", 3: "bg-amber-300", 4: "bg-orange-400", 5: "bg-rose-400" };

interface Row extends Idea {
  score: number;
  share: number;
}

function valueOf(row: Row, key: SortKey): number {
  return key === "score" ? row.score : row[key];
}

function LevelMeter({ level }: { level: Level }) {
  return (
    <div className="flex flex-col gap-1" aria-label={`${LEVEL_WORD[level]} (${level} of 5)`}>
      <div className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 w-3 rounded-full ${i <= level ? LEVEL_TONE[level] : "bg-white/10"}`} />
        ))}
      </div>
      <span className="text-[11px] text-white/50">{LEVEL_WORD[level]}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 60 ? "border-emerald-400/40 text-emerald-200" : score >= 50 ? "border-amber-300/40 text-amber-100" : "border-white/15 text-white/60";
  return <span className={`inline-flex h-10 w-12 items-center justify-center rounded-xl border bg-white/[0.03] font-mono text-base font-semibold tabular-nums ${tone}`}>{score}</span>;
}

function competitorTone(count: number) {
  return count <= 2 ? "text-emerald-300" : count <= 6 ? "text-amber-200" : "text-rose-300";
}

function IdeaRow({ row, rank }: { row: Row; rank: number }) {
  const need = customersFor(row.ticket);
  const shareTone = row.share <= 0.05 ? "text-emerald-300" : row.share <= 0.1 ? "text-amber-200" : "text-rose-300";
  return (
    <li className="grid grid-cols-[2rem_1fr_auto] gap-x-3 gap-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.04] lg:grid-cols-[2.5rem_minmax(0,2.6fr)_repeat(5,minmax(0,1fr))_4rem] lg:items-center lg:gap-4 lg:rounded-xl lg:px-4 lg:py-3">
      <span className="pt-0.5 font-mono text-xs text-white/30 tabular-nums lg:pt-0">{String(rank).padStart(2, "0")}</span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{row.idea}</p>
        <p className="mt-0.5 text-xs text-white/40">
          <span className="text-emerald-300/80">{row.group}</span> · {row.note}
        </p>
      </div>

      <div className="lg:hidden">
        <ScoreBadge score={row.score} />
      </div>

      {/* Metrics: a 2–3 column grid on phones, table cells on large screens. */}
      <div className="col-span-3 col-start-1 grid grid-cols-2 gap-3 border-t border-white/5 pt-3 sm:grid-cols-3 lg:contents">
        <div>
          <p className="text-[10px] tracking-wide text-white/35 uppercase lg:hidden">Ticket / month</p>
          <p className="text-sm font-semibold text-white tabular-nums">{formatInr(row.ticket)}</p>
          {row.ticketEstimated && <p className="text-[11px] text-white/35">est.</p>}
        </div>
        <div>
          <p className="mb-1 text-[10px] tracking-wide text-white/35 uppercase lg:hidden">Build</p>
          <LevelMeter level={row.build} />
        </div>
        <div>
          <p className="text-[10px] tracking-wide text-white/35 uppercase lg:hidden">Businesses</p>
          <p className="text-sm text-white tabular-nums">{row.bodiesLabel}</p>
          <p className="text-[11px] text-white/40">
            need {need.toLocaleString("en-IN")} <span className={shareTone}>({(row.share * 100).toFixed(1)}%)</span>
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] tracking-wide text-white/35 uppercase lg:hidden">Marketing</p>
          <LevelMeter level={row.marketing} />
        </div>
        <div>
          <p className="text-[10px] tracking-wide text-white/35 uppercase lg:hidden">Competitors</p>
          <p className={`text-sm font-semibold tabular-nums ${competitorTone(row.competitors)}`}>{row.competitors}</p>
          <p className="truncate text-[11px] text-white/35" title={row.competitorNote}>
            {row.competitorNote}
          </p>
        </div>
      </div>

      <div className="hidden justify-end lg:flex">
        <ScoreBadge score={row.score} />
      </div>
    </li>
  );
}

export default function IdeaList() {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });

  const rows = useMemo(() => {
    const scored: Row[] = IDEAS.map((idea) => ({ ...idea, score: scoreOf(idea), share: shareNeeded(idea) }));
    return scored.sort((a, b) => (valueOf(a, sort.key) - valueOf(b, sort.key)) * sort.dir || b.score - a.score);
  }, [sort]);

  function sortBy(key: SortKey) {
    const best = COLUMNS.find((c) => c.key === key)?.better === "high" ? -1 : 1;
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: best }));
  }

  const weightText = `ticket ${WEIGHTS.ticket * 100}% · share of group needed ${WEIGHTS.share * 100}% · competitors ${WEIGHTS.competitors * 100}% · marketing ${WEIGHTS.marketing * 100}% · build ${WEIGHTS.build * 100}%`;

  return (
    <div className="h-full overflow-y-auto bg-[#07080a] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-32 sm:px-8">
        <header className="pb-8">
          <p className="text-xs tracking-[0.2em] text-emerald-300/70 uppercase">Ideas</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">Every idea from the research, best first</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
            {IDEAS.length} ideas from {new Set(IDEAS.map((i) => i.group)).size} group analyses. Ticket is the suggested entry price per business per month; &quot;need&quot; is how many paying businesses reach ₹50 Cr a year, and the share of the group that is.
          </p>
          <p className="mt-2 text-xs text-white/35">Score weights: {weightText}. Click a column to re-sort.</p>
        </header>

        <div className="sticky top-0 z-10 -mx-1 mb-2 hidden grid-cols-[2.5rem_minmax(0,2.6fr)_repeat(5,minmax(0,1fr))_4rem] gap-4 rounded-xl bg-[#07080a]/90 px-5 py-2 backdrop-blur lg:grid">
          <span className="text-[10px] tracking-wide text-white/30 uppercase">#</span>
          <span className="text-[10px] tracking-wide text-white/30 uppercase">Idea</span>
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => sortBy(c.key)}
              aria-sort={sort.key === c.key ? (sort.dir === -1 ? "descending" : "ascending") : "none"}
              className={`flex items-center gap-1 text-left text-[10px] tracking-wide uppercase transition hover:text-white focus-visible:text-white focus-visible:outline-none ${c.key === "score" ? "justify-end" : ""} ${sort.key === c.key ? "text-emerald-300" : "text-white/40"}`}
            >
              {c.label}
              <span aria-hidden className="text-[9px]">{sort.key === c.key ? (sort.dir === -1 ? "▼" : "▲") : ""}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => sortBy(c.key)}
              className={`rounded-full border px-3 py-1 text-xs transition ${sort.key === c.key ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-200" : "border-white/10 text-white/50 hover:text-white"}`}
            >
              {c.label} {sort.key === c.key ? (sort.dir === -1 ? "▼" : "▲") : ""}
            </button>
          ))}
        </div>

        <ol className="space-y-2">
          {rows.map((row, i) => (
            <IdeaRow key={row.id} row={row} rank={i + 1} />
          ))}
        </ol>

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/35">
          Ratings are judgments from each group&apos;s README (analyses/&lt;group&gt;/README.md). Group sizes marked &quot;estimate&quot; are unsourced. Competitor counts are direct competitors seen in the data, not the wider crowded market. Prices marked est. were set after the analysis was written. Source: app/_components/idea-list/idea-data.ts.
        </p>
      </div>
    </div>
  );
}
