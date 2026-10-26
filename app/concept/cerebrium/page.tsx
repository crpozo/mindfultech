import type { Metadata } from "next";
import { Cerebrium } from "@/components/concepts/Cerebrium";

export const metadata: Metadata = { title: "MindfulTech · Concepts · Cerebrium", robots: { index: false, follow: false } };

export default function CerebriumPage() {
  return <Cerebrium />;
}
