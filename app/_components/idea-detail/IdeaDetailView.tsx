import type { ReactNode } from "react";
import Link from "next/link";
import { customersFor, formatInr } from "../idea-guide/guide-data";
import type { Idea } from "../idea-list/idea-data";
import { customersForUsd, GLOBAL, scoreOf, shareNeeded } from "../idea-list/idea-data";
import type { Fact, FactKind, IdeaDetail } from "./details";

const KIND: Record<FactKind, { label: string; tone: string }> = {
  confirmed: { label: "Confirmed", tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  "our-data": { label: "Our data", tone: "border-sky-400/30 bg-sky-400/10 text-sky-200" },
  assumption: { label: "Assumption", tone: "border-amber-300/30 bg-amber-300/10 text-amber-100" },
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <p className="text-[10px] tracking-wide text-white/35 uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}

function FactItem({ fact }: { fact: Fact }) {
  const k = KIND[fact.kind];
  return (
    <li className="grid gap-2 border-t border-white/5 py-3 first:border-t-0 sm:grid-cols-[6.5rem_1fr] sm:gap-4">
      <span className={`h-fit w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${k.tone}`}>{k.label}</span>
      <div>
        <p className="text-sm leading-relaxed text-white/85">{fact.text}</p>
        {(fact.source || fact.caveat) && (
          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
            {fact.source &&
              (fact.url ? (
                <a href={fact.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 transition hover:text-white">
                  {fact.source}
                </a>
              ) : (
                fact.source
              ))}
            {fact.source && fact.caveat && " · "}
            {fact.caveat && <span className="text-amber-200/70">{fact.caveat}</span>}
          </p>
        )}
      </div>
    </li>
  );
}

function Block({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="rounded-3xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6">
      <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      {lead && <p className="mt-1 text-xs leading-relaxed text-white/45">{lead}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function IdeaDetailView({ idea, detail }: { idea: Idea; detail?: IdeaDetail }) {
  const g = GLOBAL[idea.id] ?? null;
  const share = shareNeeded(idea, "india") ?? 0;
  const globalShare = shareNeeded(idea, "global");

  return (
    <div className="h-full w-full overflow-y-auto bg-[#07080a] px-4 pt-8 pb-28 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/?tab=ideas" className="text-xs text-white/40 transition hover:text-white">
          ← Ideas ranked
        </Link>

        <header className="mt-5 pb-6">
          <p className="text-xs text-emerald-300/80">
            {idea.group}
            {detail && <span className="ml-2 rounded-full border border-emerald-300/30 px-2 py-0.5 text-[10px] text-emerald-200">{detail.status}</span>}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">{idea.idea}</h1>
          {detail && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">{detail.summary}</p>}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Ticket / month" value={formatInr(idea.ticket)} sub={g ? `$${g.ticket.toLocaleString("en-US")} global` : "India only"} />
            <Stat label="Customers for ₹50 Cr" value={customersFor(idea.ticket).toLocaleString("en-IN")} sub={`${(share * 100).toFixed(1)}% of ${idea.bodiesLabel} India`} />
            <Stat label="Global need" value={g ? customersForUsd(g.ticket).toLocaleString("en-US") : "—"} sub={g && globalShare !== null ? `${(globalShare * 100).toFixed(1)}% of ${g.bodiesLabel}` : "India only"} />
            <Stat label="Score" value={`${scoreOf(idea, "india")}`} sub={g ? `${scoreOf(idea, "global")} global` : "India"} />
          </div>
        </header>

        {!detail ? (
          <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center">
            <p className="text-sm text-white/60">No deep dive yet</p>
            <p className="mt-1 text-xs text-white/35">{idea.note}. Details come from analyses/ once this idea is researched further.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-[11px] text-white/45">
              {(Object.keys(KIND) as FactKind[]).map((k) => (
                <span key={k} className={`rounded-full border px-2 py-0.5 ${KIND[k].tone}`}>{KIND[k].label}</span>
              ))}
              <span className="self-center">Updated {detail.updated}</span>
            </div>

            {detail.sections.map((s) => (
              <Block key={s.id} id={s.id} title={s.title} lead={s.lead}>
                <ul>{s.facts.map((f, i) => <FactItem key={i} fact={f} />)}</ul>
              </Block>
            ))}

            <Block id="competitors" title="Competitors and prices">
              <div className="divide-y divide-white/5">
                {detail.competitors.map((c) => (
                  <div key={c.product} className="grid gap-1 py-3 sm:grid-cols-[1.2fr_1.4fr_1fr] sm:gap-4">
                    <p className="text-sm font-medium text-white">{c.product}</p>
                    <p className="text-xs text-white/50">{c.what}</p>
                    <p className="text-xs text-white/80">
                      {c.price}
                      <span className="block text-[11px] text-white/35">
                        {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white">{c.source}</a> : c.source}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </Block>

            <Block id="product" title="Proposed product" lead="Our proposal: to be tested in buyer conversations.">
              <ul className="space-y-2">
                {detail.product.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-white/80">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
                    {f}
                  </li>
                ))}
              </ul>
              <ul className="mt-4">{detail.product.pricing.map((f, i) => <FactItem key={i} fact={f} />)}</ul>
            </Block>

            <Block id="open" title="Open questions">
              <ul className="space-y-2">
                {detail.openQuestions.map((q) => (
                  <li key={q} className="flex gap-2 text-sm text-white/75">
                    <span aria-hidden className="text-amber-200/70">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </Block>

            <Block id="next" title="Next research steps">
              <ul className="space-y-2">
                {detail.nextSteps.map((s) => (
                  <li key={s.text} className="flex gap-2 text-sm text-white/75">
                    <span aria-hidden className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${s.done ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-200" : "border-white/20"}`}>{s.done ? "✓" : ""}</span>
                    {s.text}
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        )}
      </div>
    </div>
  );
}
