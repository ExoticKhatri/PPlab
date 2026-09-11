import type { Metadata } from "next";
import { PlaceholderPage } from "../_components/PlaceholderPage";

export const metadata: Metadata = {
  title: "FutaGen · pplab",
};

export default function FutaGenPage() {
  return (
    <PlaceholderPage
      eyebrow="FutaGen"
      title="Coming online"
      description="The generator isn't wired up yet — check back soon."
    />
  );
}
