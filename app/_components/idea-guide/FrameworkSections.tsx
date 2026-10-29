import Section from "./Section";
import { APPROACHES, DEGREES, METER_LABELS, RULES, WEDGE_EXAMPLES, WEDGE_PROPERTIES } from "./guide-data";

const DEGREE_TONES = ["from-sky-400/25", "from-violet-400/25", "from-fuchsia-400/25"];

function Meter({ value }: { value: number }) {
  return (
    <span className="flex gap-1" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2 w-full rounded-sm ${n <= value ? "bg-white/80" : "bg-white/10"}`} />
      ))}
    </span>
  );
}

export function DegreesSection({ index }: { index: number }) {
  return (
    <Section
      id="degrees"
      index={index}
      title="Product degrees"
      lead="Every idea inside a group falls into one of three degrees. As the degree rises, price, build effort and switching fall — and so does willingness to pay."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {DEGREES.map((d, i) => (
          <article key={d.id} className={`rounded-3xl border border-white/10 bg-gradient-to-b ${DEGREE_TONES[i]} to-transparent p-5`}>
            <p className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">Degree {d.id}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{d.name}</h3>
            <p className="text-xs text-white/40 italic">{d.term}</p>
            <p className="mt-3 text-sm text-white/70">{d.definition}</p>
            <p className="mt-2 rounded-xl bg-black/30 px-3 py-2 text-xs text-white/50">e.g. {d.example}</p>
            <dl className="mt-5 space-y-2.5">
              {METER_LABELS.map((m) => (
                <div key={m.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-3">
                  <dt className="text-[11px] text-white/45">{m.label}</dt>
                  <dd>
                    <Meter value={d.meters[m.key]} />
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 px-4 py-3 text-sm leading-relaxed text-emerald-100/80">
        <strong className="text-emerald-200">The exception that matters:</strong> willingness to pay follows <em>money</em>, not degree. A 2nd- or 3rd-degree
        product that brings cash in (claims paid, dues collected, fees received) or meets a forced compliance rule can command a 1st-degree price.
      </p>
    </Section>
  );
}

function WedgeDiagram() {
  return (
    <svg viewBox="0 0 520 200" role="img" aria-label="Wedge beside the existing system, then expanding into it" className="h-auto w-full">
      <defs>
        <linearGradient id="wedge-grow" x1="0" x2="1">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="20" y="40" width="190" height="120" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" />
      <text x="115" y="95" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13">Existing system</text>
      <text x="115" y="115" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11">(1st degree)</text>
      <circle cx="245" cy="100" r="22" fill="#34d399" />
      <text x="245" y="104" textAnchor="middle" fill="#052e1c" fontSize="11" fontWeight="700">wedge</text>
      <path d="M272 100 C 330 100, 340 60, 400 60" fill="none" stroke="url(#wedge-grow)" strokeWidth="3" />
      <path d="M272 100 C 330 100, 340 140, 400 140" fill="none" stroke="url(#wedge-grow)" strokeWidth="3" />
      <rect x="400" y="30" width="100" height="140" rx="18" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.5)" strokeDasharray="5 5" />
      <text x="450" y="95" textAnchor="middle" fill="#a7f3d0" fontSize="12">Full system</text>
      <text x="450" y="113" textAnchor="middle" fill="rgba(167,243,208,0.6)" fontSize="11">(expand)</text>
      <text x="245" y="150" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11">runs beside, no switching</text>
    </svg>
  );
}

export function ApproachesSection({ index }: { index: number }) {
  return (
    <Section id="approaches" index={index} title="Three ways to enter a market" lead="Approach C avoids A's 'not worth paying for' risk and B's switching risk.">
      <div className="grid gap-4 md:grid-cols-3">
        {APPROACHES.map((a) => (
          <article
            key={a.id}
            className={`relative rounded-3xl border p-5 ${a.preferred ? "border-emerald-300/40 bg-emerald-400/[0.06] ring-1 ring-emerald-300/20" : "border-white/10 bg-white/[0.02]"}`}
          >
            {a.preferred && <span className="absolute top-4 right-4 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-emerald-950">Preferred</span>}
            <p className="font-mono text-3xl font-semibold text-white/20">{a.id}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{a.title}</h3>
            <p className="mt-2 text-sm text-white/65">{a.what}</p>
            <p className="mt-3 text-xs text-rose-200/70">
              <span className="text-white/35">Risk · </span>
              {a.risk}
            </p>
            <p className="mt-1 text-xs text-white/40">Lands in: {a.lands}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[1.3fr_1fr]">
        <WedgeDiagram />
        <div>
          <p className="text-sm font-medium text-white">A good wedge has three properties</p>
          <ol className="mt-3 space-y-2">
            {WEDGE_PROPERTIES.map((p, i) => (
              <li key={p} className="flex gap-3 text-sm text-white/65">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-[11px] text-emerald-200">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            {WEDGE_EXAMPLES.map((e) => (
              <span key={e} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/50">
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function RulesSection({ index }: { index: number }) {
  return (
    <Section id="rules" index={index} title="Selection rules">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((r, i) => (
          <li key={r.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25 hover:bg-white/[0.04]">
            <span className="font-mono text-2xl font-semibold text-white/15">{i + 1}</span>
            <p className="mt-1 text-sm font-medium text-white">{r.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{r.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
