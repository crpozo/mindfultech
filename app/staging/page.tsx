import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { StagingHome } from "@/components/staging/StagingHome";

// Staging preview of the home redesign (Oct 2026): not linked, not indexed.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "MindfulTech · staging",
  description: "Preview of the new MindfulTech home.",
  robots: { index: false, follow: false },
};

export default function StagingPage() {
  return (
    <div className={`${serif.variable} ${jbmono.variable}`}>
      <StagingHome />
    </div>
  );
}
