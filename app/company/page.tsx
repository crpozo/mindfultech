import type { Metadata } from "next";
import { CbCompany } from "@/components/concepts/CerebriumPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "A software lab in Quito enabling companies to build AI software people love.",
};

export default function Route() {
  return <CbCompany />;
}
