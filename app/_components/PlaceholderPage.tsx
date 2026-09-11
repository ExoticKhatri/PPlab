import Link from "next/link";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="text-sm text-muted">{eyebrow}</span>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      <Link
        href="/"
        className="mt-4 text-sm font-medium text-accent transition-opacity duration-200 hover:opacity-80"
      >
        ← Back to pplab
      </Link>
    </main>
  );
}
