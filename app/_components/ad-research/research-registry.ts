import { SCHOOLS_RESEARCH } from "./ad-data";
import { LABS_RESEARCH } from "./lab-data";
import type { Research } from "./research-types";
import { TATTOO_RESEARCH } from "./tattoo-data";

// Platform analysis per group (keyed by group id in group-data.ts).
// Groups not listed here haven't been analysed yet.
export const RESEARCH_BY_GROUP: Record<string, Research> = {
  schools: SCHOOLS_RESEARCH,
  labs: LABS_RESEARCH,
  tattoo: TATTOO_RESEARCH,
};

export function getGroupResearch(groupId: string): Research | null {
  return RESEARCH_BY_GROUP[groupId] ?? null;
}
