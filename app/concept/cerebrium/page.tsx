import type { Metadata } from "next";
import { Cerebrium } from "@/components/concepts/Cerebrium";
import { latestPostCards } from "@/lib/blog/cards";

export const metadata: Metadata = { title: "MindfulTech", robots: { index: false, follow: false } };

export default function CerebriumPage() {
  return <Cerebrium posts={latestPostCards()} />;
}
