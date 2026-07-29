import type { Metadata } from "next";
import { FitnessApp } from "@/components/fitness/FitnessApp";

export const metadata: Metadata = {
  title: "Fitness · MindfulTech",
  // private panel — keep it out of search engines
  robots: { index: false, follow: false },
};

export default function FitnessPage() {
  return <FitnessApp />;
}
