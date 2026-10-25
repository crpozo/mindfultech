import type { Metadata } from "next";
import { Home } from "@/components/site/Home";
import { Shell } from "@/components/site/Shell";

export const metadata: Metadata = { title: "MindfulTech · staging", robots: { index: false, follow: false } };

/** Kept as an alias of the home after the redesign went live (Oct 2026). */
export default function StagingPage() {
  return (
    <Shell active="home">
      <Home />
    </Shell>
  );
}
