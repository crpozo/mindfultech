import type { Metadata } from "next";
import { WorkPage } from "@/components/site/WorkPage";

export const metadata: Metadata = {
  title: "Work: MindfulTech",
  description: "Case studies: real teams, measured outcomes.",
};

export default function WorkRoute() {
  return <WorkPage />;
}
