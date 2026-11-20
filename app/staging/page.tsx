import type { Metadata } from "next";
import { SparkHome } from "@/components/mt/Spark";

export const metadata: Metadata = { title: "MindfulTech · AI Software Lab", robots: { index: false, follow: false } };

/** Preview of the Nov 2026 redesign (white, sage, Sierra-like rhythm) before it replaces the live home. */
export default function StagingPage() {
  return <SparkHome />;
}
