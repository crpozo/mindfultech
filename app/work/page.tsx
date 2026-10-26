import type { Metadata } from "next";
import { CbWork } from "@/components/concepts/CerebriumPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Case studies: real teams, measured outcomes.",
};

export default function Route() {
  return <CbWork />;
}
