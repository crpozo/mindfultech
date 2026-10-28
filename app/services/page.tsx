import type { Metadata } from "next";
import { CbServices } from "@/components/concepts/CerebriumPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Research, software, AI agents and cybersecurity. Five services, one team.",
};

export default function Route() {
  return <CbServices />;
}
