"use client";

import { CandidatesSection, ChangelogSection } from "./CandidatesSection";
import { ProcessSection, ScoringSection, SignalsSection } from "./DecisionSections";
import { ApproachesSection, DegreesSection, RulesSection } from "./FrameworkSections";
import TargetSection from "./TargetSection";

const NAV = [
  { id: "target", label: "The target" },
  { id: "degrees", label: "Product degrees" },
  { id: "approaches", label: "Ways to enter" },
  { id: "rules", label: "Selection rules" },
  { id: "scoring", label: "Scoring" },
  { id: "signals", label: "Research signals" },
  { id: "process", label: "Process" },
  { id: "candidates", label: "Candidates" },
  { id: "changelog", label: "Change log" },
];

export default function IdeaGuide() {
  return (
    <div className="h-full overflow-y-auto bg-[#07080a] text-white">
      <div className="mx-auto flex max-w-7xl gap-10 px-4 pt-10 pb-32 sm:px-8">
        <nav aria-label="Guide sections" className="sticky top-10 hidden h-fit w-44 shrink-0 lg:block">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Idea guide</p>
          <ol className="mt-4 space-y-1">
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/45 transition hover:bg-white/5 hover:text-white">
                  <span className="font-mono text-[10px] text-white/25 group-hover:text-emerald-300">{String(i + 1).padStart(2, "0")}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="min-w-0 flex-1">
          <header className="pb-6">
            <p className="text-xs tracking-[0.2em] text-emerald-300/70 uppercase">Idea selection guide</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">From a researched group to the one product worth building</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/50">
              The central reference for choosing what to build toward ₹50 Cr revenue a year. Source: docs/product-degrees.md.
            </p>
          </header>
          <TargetSection index={1} />
          <DegreesSection index={2} />
          <ApproachesSection index={3} />
          <RulesSection index={4} />
          <ScoringSection index={5} />
          <SignalsSection index={6} />
          <ProcessSection index={7} />
          <CandidatesSection index={8} />
          <ChangelogSection index={9} />
        </main>
      </div>
    </div>
  );
}
