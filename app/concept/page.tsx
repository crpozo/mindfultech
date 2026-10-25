import type { Metadata } from "next";
import { ConceptIndex } from "@/components/concepts/ConceptIndex";

export const metadata: Metadata = { title: "MindfulTech · Concepts", robots: { index: false, follow: false } };

export default function ConceptPage() {
  return <ConceptIndex />;
}
