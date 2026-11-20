import type { Metadata } from "next";
import { SparkHome } from "@/components/mt/Spark";

export const metadata: Metadata = { title: "MindfulTech", robots: { index: false, follow: false } };

/** Alias of the home, kept so links shared during the Nov 2026 redesign keep working. */
export default function StagingPage() {
  return <SparkHome />;
}
