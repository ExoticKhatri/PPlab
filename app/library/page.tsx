import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Library · pplab",
};

export default function LibraryPage() {
  return (
    <PlaceholderPage
      eyebrow="Library"
      title="Coming online"
      description="The archive isn't wired up yet — check back soon."
    />
  );
}
