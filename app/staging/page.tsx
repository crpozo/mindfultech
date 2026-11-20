import type { Metadata } from "next";
import { MtHome } from "@/components/mt/Home";

export const metadata: Metadata = { title: "MindfulTech · AI Software Lab", robots: { index: false, follow: false } };

/** Preview of the Nov 2026 redesign (white, sage, Sierra-like rhythm) before it replaces the live home. */
export default function StagingPage() {
  return <MtHome />;
}
