"use client";

import { useState } from "react";
import BrainstormBoard from "../brainstorm-board/BrainstormBoard";
import GroupFinder from "../group-finder/GroupFinder";
import NetworkMindmap from "../network-mindmap/NetworkMindmap";

type TabId = "industries" | "groups";

const TABS: { id: TabId; label: string }[] = [
  { id: "industries", label: "Industries" },
  { id: "groups", label: "Group finder" },
];

export default function HomeTabs() {
  const [active, setActive] = useState<TabId>("industries");

  return (
    <div className="fixed inset-0">
      {active === "industries" && (
        <>
          <NetworkMindmap />
          <BrainstormBoard />
        </>
      )}
      {active === "groups" && <GroupFinder />}

      <nav
        aria-label="Workspace tabs"
        className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-black/60 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:bottom-6"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-current={active === tab.id ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition sm:px-5 sm:text-sm ${
              active === tab.id
                ? "bg-white text-black shadow"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
