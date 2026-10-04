import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/data/tools";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-16">
      <section aria-label="Tools" className="mx-auto w-full max-w-5xl">
        <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {tools.map((tool) => (
            <li key={tool.index}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
