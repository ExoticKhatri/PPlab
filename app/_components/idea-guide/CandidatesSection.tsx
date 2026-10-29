import Section from "./Section";
import type { Candidate, CandidateStatus } from "./guide-data";
import { CANDIDATES, CHANGELOG, customersFor, formatInr } from "./guide-data";

const STATUS_TONE: Record<CandidateStatus, string> = {
  shortlist: "bg-emerald-400 text-emerald-950",
  conditional: "bg-amber-300 text-amber-950",
  below: "bg-rose-400 text-rose-950",
};

// Gauge of the share of the group needed for ₹50 Cr/year: scale 0–20%, with 5% and 10% marks.
function ShareGauge({ share, label }: { share: number; label: string }) {
  const tone = share <= 0.05 ? "bg-emerald-400" : share <= 0.1 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div>
      <div className="flex justify-between text-[11px] text-white/45">
        <span>{label}</span>
        <span className="text-white/80 tabular-nums">{(share * 100).toFixed(1)}%</span>
      </div>
      <div className="relative mt-1.5 h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, share * 500)}%` }} />
        <span aria-hidden className="absolute -top-1 h-4 w-px bg-white/40" style={{ left: "25%" }} />
        <span aria-hidden className="absolute -top-1 h-4 w-px bg-white/25" style={{ left: "50%" }} />
      </div>
    </div>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  const wedgeNeed = customersFor(c.wedgePrice);
  const expandedNeed = customersFor(c.expandedPrice);
  return (
    <article className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{c.group}</h3>
          <p className="text-xs text-white/40">
            {c.groupSizeLabel} businesses · crowded: {c.firstDegree}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_TONE[c.status]}`}>{c.statusNote}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-black/30 p-4">
        <p className="text-[10px] tracking-wide text-white/35 uppercase">Wedge · degree {c.degree}</p>
        <p className="mt-0.5 text-sm font-medium text-emerald-200">{c.wedge}</p>
        <p className="mt-1 text-xs text-white/45">Cash link: {c.cashLink}</p>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div>
          <p className="text-lg font-semibold text-white tabular-nums">{formatInr(c.wedgePrice)}</p>
          <p className="text-[10px] text-white/40">wedge / mo</p>
        </div>
        <span className="text-emerald-300/70">→</span>
        <div>
          <p className="text-lg font-semibold text-white tabular-nums">{formatInr(c.expandedPrice)}</p>
          <p className="text-[10px] text-white/40">after expansion ({c.expansion})</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ShareGauge share={wedgeNeed / c.groupSize} label={`Wedge only: ${wedgeNeed.toLocaleString("en-IN")} customers`} />
        <ShareGauge share={expandedNeed / c.groupSize} label={`After expansion: ${expandedNeed.toLocaleString("en-IN")} customers`} />
      </div>

      <ul className="mt-4 flex-1 space-y-1.5 border-t border-white/5 pt-4">
        {c.evidence.map((e) => (
          <li key={e} className="flex gap-2 text-xs text-white/55">
            <span className="text-white/25">•</span>
            {e}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function CandidatesSection({ index }: { index: number }) {
  return (
    <Section
      id="candidates"
      index={index}
      title="Current candidates"
      lead="Customer counts are for ₹50 Cr/year. Gauges show the share of the group needed (marks at 5% and 10%). Prices and group sizes are estimates until buyer conversations confirm them."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {CANDIDATES.map((c) => (
          <CandidateCard key={c.group} c={c} />
        ))}
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-white/60">
          <strong className="text-white">Pattern:</strong> the 1st degree is crowded in every business group, and the strongest wedge is almost always the
          step where <em>money comes in</em> — claims, receivables, fees.
        </p>
        <p className="rounded-2xl border border-amber-300/20 bg-amber-400/5 px-4 py-3 text-sm leading-relaxed text-amber-100/80">
          <strong className="text-amber-200">What ₹50 Cr changes:</strong> no wedge reaches the target on its entry price alone. Every path depends on
          expanding revenue per customer. Next: score the shortlist with expansion prices, then 5 buyer conversations for the top two.
        </p>
      </div>
    </Section>
  );
}

export function ChangelogSection({ index }: { index: number }) {
  return (
    <Section id="changelog" index={index} title="Change log">
      <ol className="relative space-y-4 border-l border-white/10 pl-6">
        {[...CHANGELOG].reverse().map((e) => (
          <li key={e.date + e.text} className="relative">
            <span className="absolute top-1.5 -left-[29px] h-2.5 w-2.5 rounded-full border-2 border-black bg-emerald-400" />
            <p className="font-mono text-[11px] text-white/35">{e.date}</p>
            <p className="text-sm text-white/70">{e.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
