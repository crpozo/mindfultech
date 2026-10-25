import type { Metadata } from "next";
import { TheDots } from "@/components/concepts/TheDots";

export const metadata: Metadata = {
  title: "MindfulTech · Concepts · The Dots",
  description: "A scroll story: six small robots automate an office overnight, one per role of the AI Management Office.",
  robots: { index: false, follow: false },
};

/** mindfultech.ec/concepts: experimental concepts for the site. Concept 01 is "The Dots". */
export default function ConceptsPage() {
  return <TheDots />;
}
