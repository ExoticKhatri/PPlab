export type ToolStatus = "live" | "soon";

export interface Tool {
  index: string;
  name: string;
  description: string;
  status: ToolStatus;
  href?: string;
}
