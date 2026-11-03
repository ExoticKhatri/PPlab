"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import BrainstormBoard from "../brainstorm-board/BrainstormBoard";
import GroupFinder from "../group-finder/GroupFinder";
import IdeaGuide from "../idea-guide/IdeaGuide";
import IdeaList from "../idea-list/IdeaList";
import NetworkMindmap from "../network-mindmap/NetworkMindmap";

type TabId = "industries" | "groups" | "guide" | "ideas";

const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

// Icons only in the tab bar; the label is the tooltip and the accessible name.
const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: "industries",
    label: "Industries",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="5" r="2.2" />
        <circle cx="5" cy="18" r="2.2" />
        <circle cx="19" cy="18" r="2.2" />
        <path d="M11 7 6.2 16M13 7l4.8 9M7.2 18h9.6" />
      </svg>
    ),
  },
  {
    id: "groups",
    label: "Group finder",
    icon: (
      <svg {...iconProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.5-4.5" />
        <circle cx="10.5" cy="9" r="1.8" />
        <path d="M7.5 13.5c.7-1.3 1.8-2 3-2s2.3.7 3 2" />
      </svg>
    ),
  },
  {
    id: "guide",
    label: "Idea guide",
    icon: (
      <svg {...iconProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: "ideas",
    label: "Ideas ranked",
    icon: (
      <svg {...iconProps}>
        <path d="M9 6h11M9 12h8M9 18h5" />
        <path d="M4 5l1 .8V8M3.6 11.2c.4-.6 1.8-.6 1.8.4 0 .8-1.8 1.4-1.8 2.4h2M3.8 17h1.4c.6 0 .6 1 0 1.1.6.1.6 1.1 0 1.2H3.8" />
      </svg>
    ),
  },
];

export default function HomeTabs() {
  const requested = useSearchParams().get("tab");
  const [active, setActive] = useState<TabId>(
    TABS.some((t) => t.id === requested) ? (requested as TabId) : "industries",
  );

  return (
    <div className="fixed inset-0">
      {active === "industries" && (
        <>
          <NetworkMindmap />
          <BrainstormBoard />
        </>
      )}
      {active === "groups" && <GroupFinder />}
      {active === "guide" && <IdeaGuide />}
      {active === "ideas" && <IdeaList />}

      <nav
        aria-label="Workspace tabs"
        className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-black/60 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:bottom-6"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-label={tab.label}
            title={tab.label}
            aria-current={active === tab.id ? "page" : undefined}
            className={`grid h-10 w-12 place-items-center rounded-full transition focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:outline-none sm:h-11 sm:w-14 ${
              active === tab.id
                ? "bg-white text-black shadow"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  );
}
