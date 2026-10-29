import Section from "./Section";
import { CRITERIA, PROCESS, SCORE_BANDS, SIGNALS } from "./guide-data";

const BAND_TONE = { rose: "bg-rose-400/70", amber: "bg-amber-400/70", emerald: "bg-emerald-400/80" } as const;
const SIGNAL_TONE = {
  good: "border-emerald-300/25 bg-emerald-400/5 text-emerald-200",
  warn: "border-rose-300/25 bg-rose-400/5 text-rose-200",
  info: "border-sky-300/25 bg-sky-400/5 text-sky-200",
} as const;
const SIGNAL_LABEL = { good: "Opportunity", warn: "Warning", info: "Where to look" } as const;

export function ScoringSection({ index }: { index: number }) {
  return (
    <Section id="scoring" index={index} title="Scoring a candidate idea" lead="Score each criterion 1–5, multiply by its weight, add up. Maximum 100.">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-xs text-white/40">How the 100 points are split</p>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full">
          {CRITERIA.map((c, i) => (
            <div
              key={c.name}
              title={`${c.name}: up to ${c.weight * 5} points`}
              className={i % 2 ? "bg-white/25" : "bg-white/45"}
              style={{ width: `${c.weight * 5}%` }}
            />
          ))}
        </div>
        <ul className="mt-6 divide-y divide-white/5">
          {CRITERIA.map((c) => (
            <li key={c.name} className="grid gap-2 py-3 sm:grid-cols-[12rem_6rem_1fr] sm:items-center">
              <p className="text-sm text-white">{c.name}</p>
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} className={`h-3 w-2 rounded-sm ${n <= c.weight ? "bg-emerald-300" : "bg-white/10"}`} />
                  ))}
                </span>
                <span className="text-[11px] text-white/40 tabular-nums">×{c.weight}</span>
              </div>
              <p className="text-xs text-white/45">
                <span className="text-emerald-200/80">5 = </span>
                {c.high}
                <span className="mx-2 text-white/20">·</span>
                <span className="text-rose-200/70">1 = </span>
                {c.low}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="text-xs text-white/40">Read the total</p>
          <div className="mt-2 flex h-9 overflow-hidden rounded-xl text-[11px] font-medium">
            {SCORE_BANDS.map((b) => (
              <div key={b.label} className={`flex items-center justify-center text-black/80 ${BAND_TONE[b.tone]}`} style={{ width: `${b.to - b.from}%` }}>
                {b.label}
              </div>
            ))}
          </div>
          <div className="relative mt-1 h-4 text-[10px] text-white/30 tabular-nums">
            {[0, 60, 75, 100].map((t) => (
              <span key={t} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${t}%` }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SignalsSection({ index }: { index: number }) {
  return (
    <Section id="signals" index={index} title="Reading the research signals" lead="What each source reliably shows, based on four business-group analyses.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNALS.map((s) => (
          <article key={s.signal} className={`rounded-2xl border p-4 ${SIGNAL_TONE[s.kind]}`}>
            <p className="text-[10px] tracking-wide uppercase opacity-70">{SIGNAL_LABEL[s.kind]}</p>
            <p className="mt-1 text-sm font-medium text-white">{s.signal}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">{s.meaning}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function ProcessSection({ index }: { index: number }) {
  return (
    <Section id="process" index={index} title="Process: from group to decision">
      <ol className="relative grid gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {PROCESS.map((p, i) => (
          <li key={p.title} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">{i + 1}</span>
            <p className="mt-3 text-sm font-medium text-white">{p.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">{p.body}</p>
            {i < PROCESS.length - 1 && <span aria-hidden className="absolute top-1/2 -right-3 hidden text-white/20 lg:block">›</span>}
          </li>
        ))}
      </ol>
    </Section>
  );
}
