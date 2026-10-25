import type { Metadata } from "next";
import { Hut8 } from "@/components/concepts/Hut8";

export const metadata: Metadata = { title: "MindfulTech · Concepts · Hut 8", robots: { index: false, follow: false } };

export default function Hut8Page() {
  return <Hut8 />;
}
