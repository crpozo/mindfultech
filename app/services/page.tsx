import type { Metadata } from "next";
import { CbServices } from "@/components/concepts/CerebriumPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Research, software and AI agents. Four services, one team.",
};

export default function Route() {
  return <CbServices />;
}
