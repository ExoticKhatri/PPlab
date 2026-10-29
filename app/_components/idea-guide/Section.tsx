import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  index: number;
  title: string;
  lead?: string;
  children: ReactNode;
}

export default function Section({ id, index, title, lead, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-white/5 py-12 first:border-t-0 first:pt-4">
      <p className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">{String(index).padStart(2, "0")}</p>
      <h2 id={`${id}-title`} className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
