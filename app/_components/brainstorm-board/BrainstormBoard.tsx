"use client";

import { useState } from "react";
import type { Chip, Stage, StageStatus } from "./board-data";
import {
  INDUSTRY_FACTORS,
  OPEN_QUESTION,
  PATH,
  PRODUCT_FACTOR,
} from "./board-data";

const DOT_STYLES: Record<StageStatus, string> = {
  locked: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]",
  tentative: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.5)]",
  blank: "bg-rose-400 shadow-[0_0_10px_2px_rgba(251,113,133,0.6)] animate-pulse",
};

const CARD_STYLES: Record<StageStatus, string> = {
  locked: "border-white/15 bg-white/5",
  tentative: "border-amber-400/30 border-dashed bg-amber-400/5",
  blank: "border-rose-400/40 border-dashed bg-rose-400/5",
};

function StageRow({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT_STYLES[stage.status]}`} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-white/15" />}
      </div>
      <div
        className={`mb-4 flex-1 rounded-xl border px-3 py-2.5 ${CARD_STYLES[stage.status]}`}
      >
        <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
          {stage.label}
        </p>
        <p className="text-base font-semibold text-white">{stage.title}</p>
        {stage.detail && (
          <p className="mt-0.5 text-xs leading-snug text-white/60">
            {stage.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function FactorChip({ chip }: { chip: Chip }) {
  const resolved = chip.status === "resolved";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
        resolved
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-dashed border-rose-400/40 bg-rose-400/5 text-rose-200"
      }`}
    >
      {chip.label}
      {!resolved && <span className="font-bold text-rose-300">?</span>}
    </span>
  );
}

export default function BrainstormBoard() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="pointer-events-auto fixed top-4 right-4 z-20 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition hover:bg-white/10 sm:top-6 sm:right-6"
      >
        {isOpen ? "Hide board" : "Show board"}
      </button>

      {isOpen && (
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-20 z-10 max-h-[65vh] overflow-y-auto rounded-2xl border-t border-white/10 bg-black/60 p-4 pt-5 backdrop-blur-md sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-auto sm:w-96 sm:rounded-2xl sm:border"
        >
          {PATH.map((stage, index) => (
            <StageRow
              key={stage.id}
              stage={stage}
              isLast={index === PATH.length - 1}
            />
          ))}

          <div className="mb-4 rounded-xl border border-dashed border-rose-400/40 bg-rose-400/5 px-3 py-2.5">
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              Factors in play for the industry pick
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {INDUSTRY_FACTORS.map((chip) => (
                <FactorChip key={chip.label} chip={chip} />
              ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-snug text-rose-200">
              <span className="font-bold text-rose-300">?</span>
              {OPEN_QUESTION}
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              Product idea depends on
            </p>
            <div className="mt-2">
              <FactorChip chip={PRODUCT_FACTOR} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
