import Link from "next/link";
import type { Tool } from "@/types/tool";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isLive = tool.status === "live";
  const cardClassName = `tool-card group flex h-60 flex-col gap-3 overflow-hidden p-7 ${
    isLive ? "" : "tool-card--dormant"
  }`;

  const content = (
    <>
      <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
        {tool.index}
      </span>

      <h3
        className={`text-xl font-semibold tracking-tight ${
          isLive ? "text-foreground" : "text-muted"
        }`}
      >
        {tool.name}
      </h3>

      <p className="text-sm text-muted">{tool.description}</p>

      {isLive && (
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Open
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path
              d="M3 7h8M7 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  if (isLive && tool.href) {
    return (
      <Link href={tool.href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
