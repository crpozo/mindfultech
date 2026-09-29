import type { Metadata } from "next";
import { JevDemo } from "@/components/jev/JevDemo";

export const metadata: Metadata = {
  title: "Jev demo · MindfulTech",
  description: "A simulated walkthrough of TypeSafe's Jev: typed judgments in ~150 ms next to a general LLM, and a live lead router built on those judgments.",
  robots: { index: false, follow: false },
};

export default function JevPage() {
  return <JevDemo />;
}
