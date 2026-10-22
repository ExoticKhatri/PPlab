import type { QuoteSection, Research, Verdict } from "./research-types";

const VERDICT_STYLE: Record<Verdict, { bar: string; label: string }> = {
  crowded: { bar: "bg-rose-400", label: "text-rose-300" },
  busy: { bar: "bg-amber-400", label: "text-amber-300" },
  open: { bar: "bg-emerald-400", label: "text-emerald-300" },
};


function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[10px] tracking-[0.2em] text-white/30 uppercase">{children}</p>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-white tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/40">{label}</p>
    </div>
  );
}

function QuoteGrid({ quotes }: { quotes: QuoteSection["quotes"] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {quotes.map((q) => (
        <li key={q.text} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <p className="text-sm leading-snug text-white/80">“{q.text}”</p>
          <p className="mt-1.5 text-[11px] text-white/35">{q.by}</p>
        </li>
      ))}
    </ul>
  );
}

interface AdResearchProps {
  research: Research;
  header?: React.ReactNode;
}

export default function AdResearch({ research, header }: AdResearchProps) {
  const { scan, categories, pains, reviews, extra, ideas, takeaways } = research;
  const maxAdvertisers = Math.max(...categories.map((c) => c.advertisers));
  const maxTheme = Math.max(...reviews.themes.map((t) => t.count));
  return (
    <div className="h-full w-full overflow-y-auto bg-[#05070f] text-white">
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-28 sm:px-8">
        {header}
        <p className="text-xs text-white/40">
          Meta Ad Library · {research.audience} · India · {scan.date}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-4 border-b border-white/5 pb-6">
          <Stat value={scan.adsScanned.toLocaleString("en-IN")} label={`ads scanned · ${scan.keywords} keywords`} />
          <Stat value={`~${scan.sellers}`} label={scan.sellersLabel} />
          <Stat value={`${scan.longestDays}d`} label="longest-running ad" />
        </div>

        <section className="mt-8">
          <SectionLabel>What it tells us</SectionLabel>
          <ol className="space-y-3">
            {takeaways.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/75">
                <span className="font-mono text-xs text-white/25">0{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <SectionLabel>Who is selling what · advertisers per category</SectionLabel>
          <ul>
            {categories.map((c) => {
              const style = VERDICT_STYLE[c.verdict];
              return (
                <li key={c.id} className="border-b border-white/5 py-3" title={c.examples}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm text-white/90">{c.name}</p>
                    <p className="shrink-0 text-xs tabular-nums">
                      <span className="text-white/80">{c.advertisers}</span>
                      <span className={`ml-2 ${style.label}`}>{c.verdict}</span>
                    </p>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${style.bar}`}
                      style={{ width: `${(c.advertisers / maxAdvertisers) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 truncate text-[11px] text-white/35">
                    {c.examples} · longest {c.longestDays}d ({c.longestBy})
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10">
          <SectionLabel>The pain sellers lead with</SectionLabel>
          <QuoteGrid quotes={pains} />
        </section>

        <section className="mt-10">
          <SectionLabel>{reviews.label}</SectionLabel>
          <p className="mb-4 text-sm leading-relaxed text-white/70">{reviews.takeaway}</p>
          <ul>
            {reviews.themes.map((t) => (
              <li key={t.name} className="flex items-center gap-3 py-1.5">
                <span className="w-44 shrink-0 truncate text-xs text-white/70 sm:w-56">{t.name}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${t.highlight ? "bg-emerald-400" : "bg-white/25"}`}
                    style={{ width: `${(t.count / maxTheme) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-white/40 tabular-nums">{t.count}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <QuoteGrid quotes={reviews.quotes} />
          </div>
        </section>

        {extra && (
          <section className="mt-10">
            <SectionLabel>{extra.label}</SectionLabel>
            <p className="mb-4 text-sm leading-relaxed text-white/70">{extra.takeaway}</p>
            <QuoteGrid quotes={extra.quotes} />
          </section>
        )}

        <section className="mt-10">
          <SectionLabel>Idea candidates · to test with ads</SectionLabel>
          <ol className="space-y-3">
            {ideas.map((idea) => (
              <li key={idea.rank} className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] px-4 py-3.5">
                <p className="flex items-baseline gap-2 text-sm font-medium text-white">
                  <span className="font-mono text-xs text-emerald-300/70">0{idea.rank}</span>
                  {idea.title}
                  <span className="ml-auto shrink-0 text-[10px] font-normal text-white/35">{idea.evidence}</span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">{idea.why}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-200/60">Risk: {idea.risk}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed text-white/25">
          Meta doesn&apos;t show spend or results for these ads, so how long an ad has run is the best available sign that
          it pays off. This is a snapshot of ads active on one day. Counts are approximate.
        </p>
      </div>
    </div>
  );
}
