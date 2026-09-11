export type ToolStatus = "live" | "soon";

export interface Tool {
  index: string;
  name: string;
  description: string;
  status: ToolStatus;
  href?: string;
}

export const tools: Tool[] = [
  {
    index: "01",
    name: "FutaGen",
    description:
      "Generative image tool. Produces original portraits of demon ladies, one seed at a time.",
    status: "live",
    href: "/futagen",
  },
  {
    index: "02",
    name: "Library",
    description:
      "A running archive of every image generated across the lab's tools.",
    status: "live",
    href: "/library",
  },
  {
    index: "03",
    name: "Coming soon",
    description: "Reserved for a future tool.",
    status: "soon",
  },
  {
    index: "04",
    name: "Coming soon",
    description: "Reserved for a future tool.",
    status: "soon",
  },
  {
    index: "05",
    name: "Coming soon",
    description: "Reserved for a future tool.",
    status: "soon",
  },
  {
    index: "06",
    name: "Coming soon",
    description: "Reserved for a future tool.",
    status: "soon",
  },
];
