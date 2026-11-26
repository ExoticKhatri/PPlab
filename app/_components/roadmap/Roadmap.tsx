"use client";

import type { ReactNode } from "react";
import type { IdeaStatus, Step } from "./roadmap-data";
import { CHOOSER, CHOOSER_TESTS, DID, IDEA_STATUS, LADDER, LESSONS, NEXT, STEPS, UPDATED } from "./roadmap-data";

const STATUS_TONE: Record<IdeaStatus["status"], string> = {
  testing: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  backup: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  crowded: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  parked: "border-white/15 bg-white/5 text-white/55",
  dropped: "border-rose-300/30 bg-rose-300/10 text-rose-200",
};

function Marker({ status }: { status: Step["status"] | "unknown" }) {
  if (status === "done") {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-300 text-sm font-bold text-black" aria-label="Done">
        ✓
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="relative grid h-8 w-8 place-items-center" aria-label="In progress">
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-300/30 motion-reduce:animate-none" />
        <span className="h-4 w-4 rounded-full border-2 border-amber-300 bg-amber-300/30" />
      </span>
    );
  }
  return <span className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-white/25 text-xs text-white/40" aria-label="Not known yet">?</span>;
}

function Card({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-sm leading-relaxed text-white/75">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
          {t}
        </li>
      ))}
    </ul>
  );
}

function Check({ value }: { value: boolean | "weak" }) {
  if (value === true) return <span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-xs text-emerald-200">Yes</span>;
  if (value === "weak") return <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-xs text-amber-100">Weak</span>;
  return <span className="rounded-full bg-rose-300/15 px-2 py-0.5 text-xs text-rose-200">No</span>;
}

// Everything we know about the step we're on.
function CurrentStepDetail() {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Card title="What we did">
        <List items={DID} />
      </Card>
      <Card title="Where each idea stands">
        <ul className="space-y-3">
          {IDEA_STATUS.map((i) => (
            <li key={i.idea}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-white">{i.idea}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_TONE[i.status]}`}>{i.status}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-white/50">{i.why}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="What we learned">
        <ol className="space-y-2">
          {LESSONS.map((l, n) => (
            <li key={l} className="flex gap-3 text-sm leading-relaxed text-white/75">
              <span className="font-mono text-xs text-emerald-300/70">{n + 1}</span>
              {l}
            </li>
          ))}
        </ol>
      </Card>
      <Card title="The blocker: validating with no product yet">
        <p className="text-xs leading-relaxed text-white/50">Sell the outcome and deliver it by hand first. Each rung asks a little more commitment from the customer.</p>
        <ol className="mt-3 space-y-1.5">
          {LADDER.map((r, n) => (
            <li key={r.rung} className="grid grid-cols-[1.5rem_1fr] gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
              <span className="font-mono text-xs text-amber-200/80">{n}</span>
              <span className="text-sm text-white/80">
                <span className="font-medium text-white">{r.rung}:</span> {r.what}
                <span className="block text-[11px] text-white/45">Proves: {r.proof}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-white/45">2-week timebox per idea, at most two at once, pass/fail numbers set in advance.</p>
      </Card>
      <Card title="Choosing the wedge to test" wide>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-xs">
            <thead>
              <tr className="text-white/40">
                <th className="py-1.5 pr-2 font-normal">Idea</th>
                {CHOOSER_TESTS.map((t) => (
                  <th key={t} className="px-2 py-1.5 text-center font-normal">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHOOSER.map((c) => (
                <tr key={c.idea} className="border-t border-white/5">
                  <td className="py-2 pr-2 text-white/80">{c.idea}</td>
                  {c.checks.map((v, n) => (
                    <td key={CHOOSER_TESTS[n]} className="px-2 py-2 text-center">
                      <Check value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-white/45">Only the real estate desk passes all four today, so it is the first test.</p>
      </Card>
      <Card title="Next actions" wide>
        <ol className="space-y-2">
          {NEXT.map((a, n) => (
            <li key={a} className="flex gap-3 text-sm leading-relaxed text-white/75">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-white/20 font-mono text-[10px] text-white/50">{n + 1}</span>
              {a}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

export default function Roadmap() {
  return (
    <div className="h-full overflow-y-auto bg-[#07080a] text-white">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-32 sm:px-8">
        <header className="pb-8">
          <p className="text-xs tracking-[0.2em] text-emerald-300/70 uppercase">Roadmap</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">From the goal to the first customers</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/50">Where the search for our business stands. Updated {UPDATED}. Source: docs/roadmap.md.</p>
        </header>

        <ol className="relative space-y-6 border-l border-white/10 pl-8">
          {STEPS.map((s, n) => (
            <li key={s.id} className="relative">
              <div className="absolute -left-[3.05rem] top-0">
                <Marker status={s.status} />
              </div>
              <p className="font-mono text-xs text-white/35">Step {n + 1}</p>
              <h2 className={`mt-1 text-xl font-semibold tracking-tight ${s.status === "current" ? "text-amber-100" : "text-white"}`}>
                {s.title}
                {s.status === "current" && <span className="ml-3 rounded-full border border-amber-300/40 px-2 py-0.5 align-middle text-[10px] font-normal text-amber-200 uppercase">We are here</span>}
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/60">{s.summary}</p>
              {s.points && (
                <div className="mt-3 max-w-3xl">
                  <List items={s.points} />
                </div>
              )}
              {s.status === "current" && <CurrentStepDetail />}
            </li>
          ))}

          <li className="relative">
            <div className="absolute -left-[3.05rem] top-0">
              <Marker status="unknown" />
            </div>
            <p className="font-mono text-xs text-white/35">Step {STEPS.length + 1} onwards</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white/50">Not known yet</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/45">
              The steps after this one will be written as we discover them, once a wedge is validated. They are likely to cover building the first version and winning the first paying customers, but the order and shape are open.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3" aria-hidden>
              {[0, 1, 2].map((k) => (
                <div key={k} className="h-14 rounded-xl border border-dashed border-white/10" />
              ))}
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
