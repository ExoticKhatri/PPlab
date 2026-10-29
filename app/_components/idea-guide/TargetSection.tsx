"use client";

import { useState } from "react";
import Section from "./Section";
import {
  GROUP_SIZES,
  INR_PER_USD,
  LEVERS,
  MILESTONE_PRICES,
  MILESTONES,
  PRICE_POINTS,
  TARGET_PER_YEAR,
  customersFor,
  formatInr,
} from "./guide-data";

// Share of a group the target needs: green under 5%, amber under 10%, red above.
function shareTone(share: number): string {
  if (share <= 0.05) return "bg-emerald-400";
  if (share <= 0.1) return "bg-amber-400";
  return "bg-rose-400";
}

function shareText(share: number): string {
  return share >= 1 ? ">100%" : `${(share * 100).toFixed(1)}%`;
}

function Headline() {
  const perMonth = TARGET_PER_YEAR / 12;
  const stats = [
    { label: "per month", value: formatInr(perMonth) },
    { label: "per day", value: formatInr(TARGET_PER_YEAR / 365) },
    { label: "global equivalent", value: `≈ $${(TARGET_PER_YEAR / INR_PER_USD / 1_000_000).toFixed(1)}M / yr` },
  ];
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-white/[0.02] to-transparent p-6 sm:p-8">
      <p className="text-xs tracking-[0.2em] text-emerald-200/70 uppercase">Revenue goal</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-white tabular-nums sm:text-7xl">
        ₹50 Cr<span className="text-2xl text-white/40 sm:text-3xl"> / year</span>
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-lg font-medium text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calculator() {
  const [index, setIndex] = useState(4); // ₹8,000
  const price = PRICE_POINTS[index];
  const need = customersFor(price);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-white/60">Price per customer / month</p>
        <p className="text-2xl font-semibold text-white tabular-nums">{formatInr(price)}</p>
      </div>
      <input
        type="range"
        min={0}
        max={PRICE_POINTS.length - 1}
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        aria-label="Price per customer per month"
        className="mt-4 w-full accent-emerald-400"
      />
      <div className="mt-6 rounded-2xl bg-black/40 p-5 text-center">
        <p className="text-xs tracking-wide text-white/40 uppercase">Paying customers needed</p>
        <p className="mt-1 text-5xl font-semibold text-emerald-300 tabular-nums">{need.toLocaleString("en-IN")}</p>
      </div>
      <div className="mt-5 space-y-3">
        {GROUP_SIZES.map((g) => {
          const share = need / g.size;
          return (
            <div key={g.label}>
              <div className="flex justify-between text-xs text-white/50">
                <span>Share of a group of {g.label}</span>
                <span className="tabular-nums text-white/80">{shareText(share)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full transition-all ${shareTone(share)}`} style={{ width: `${Math.min(100, share * 100 * 5)}%` }} />
              </div>
            </div>
          );
        })}
        <p className="text-[11px] text-white/30">Bar scale: full bar = 20% of the group. Green under 5%, amber under 10%, red above.</p>
      </div>
    </div>
  );
}

function PriceLadder() {
  const max = customersFor(PRICE_POINTS[0]);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-sm text-white/60">Customers needed at each price</p>
      <ul className="mt-4 space-y-2">
        {PRICE_POINTS.map((p) => {
          const need = customersFor(p);
          return (
            <li key={p} className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 text-xs">
              <span className="text-white/60 tabular-nums">{formatInr(p)}</span>
              <div className="h-3 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${shareTone(need / 3_00_000)}`} style={{ width: `${Math.max(2, (need / max) * 100)}%` }} />
              </div>
              <span className="text-right text-white/80 tabular-nums">{need.toLocaleString("en-IN")}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-white/30">Colour = share of a 3-lakh group.</p>
    </div>
  );
}

function Milestones() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-sm text-white/60">Milestones on the way</p>
      <div className="relative mt-6">
        <div aria-hidden className="absolute top-3 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-white/10 via-emerald-400/50 to-emerald-400 sm:block" />
      <ol className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
        {MILESTONES.map((m, i) => (
          <li key={m.perYear} className="relative text-center">
            <span className={`relative mx-auto block h-6 w-6 rounded-full border-2 ${i === MILESTONES.length - 1 ? "border-emerald-300 bg-emerald-400" : "border-white/30 bg-black"}`} />
            <p className="mt-3 text-lg font-semibold text-white tabular-nums">{formatInr(m.perYear)}</p>
            <p className="text-[11px] text-white/40">{m.label || `${formatInr(m.perYear / 12)} / mo`}</p>
            <div className="mt-2 space-y-0.5 text-[11px] text-white/50 tabular-nums">
              {MILESTONE_PRICES.map((p) => (
                <p key={p}>
                  {Math.ceil(m.perYear / (p * 12)).toLocaleString("en-IN")} @ {formatInr(p)}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
      </div>
    </div>
  );
}

export default function TargetSection({ index }: { index: number }) {
  return (
    <Section
      id="target"
      index={index}
      title="The target"
      lead="₹50 Cr of recurring software revenue a year, reached as fast as possible. Customers needed = ₹50 Cr ÷ (monthly price × 12)."
    >
      <div className="space-y-5">
        <Headline />
        <div className="grid gap-5 lg:grid-cols-2">
          <Calculator />
          <PriceLadder />
        </div>
        <Milestones />
        <div className="grid gap-3 sm:grid-cols-3">
          {LEVERS.map((l, i) => (
            <div key={l.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="font-mono text-[11px] text-emerald-300/70">Lever {i + 1}</p>
              <p className="mt-1 text-sm font-medium text-white">{l.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/45">{l.body}</p>
            </div>
          ))}
        </div>
        <p className="rounded-2xl border border-amber-300/20 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">
          <strong className="text-amber-200">Speed matters as much as size.</strong> An idea that reaches ₹1 lakh/month in 3 months beats one with a
          higher ceiling that needs 18 months to sell. Example path: a ₹5,000/month wedge that expands to ₹12,000/month reaches ₹50 Cr with ~3,500 customers.
        </p>
      </div>
    </Section>
  );
}
