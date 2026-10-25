import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { Blueprint } from "@/components/concepts/Blueprint";

const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cond", display: "swap" });

export const metadata: Metadata = {
  title: "MindfulTech · Concepts · Blueprint",
  description: "A technical-editorial concept for mindfultech.ec: paper, rulers and line drawings of the AI Management Office.",
  robots: { index: false, follow: false },
};

export default function BlueprintPage() {
  return (
    <div className={cond.variable}>
      <Blueprint />
    </div>
  );
}
