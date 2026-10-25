import type { Metadata } from "next";
import { Fauna } from "@/components/concepts/Fauna";

export const metadata: Metadata = { title: "MindfulTech · Concepts · Fauna", robots: { index: false, follow: false } };

export default function FaunaPage() {
  return <Fauna />;
}
