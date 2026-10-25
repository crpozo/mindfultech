import type { Metadata } from "next";
import { Mix } from "@/components/concepts/Mix";

export const metadata: Metadata = { title: "MindfulTech · Concepts · Mix", robots: { index: false, follow: false } };

export default function MixPage() {
  return <Mix />;
}
