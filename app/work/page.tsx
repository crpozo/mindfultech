import type { Metadata } from "next";
import { WorkBody } from "@/components/pages/WorkBody";

export const metadata: Metadata = {
  title: "Work — MindfulTech",
  description: "Case studies: real teams, measured outcomes.",
};

export default function WorkPage() {
  return <WorkBody />;
}
