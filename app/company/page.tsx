import type { Metadata } from "next";
import { SpCompany } from "@/components/mt/SparkPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "A software lab in Quito enabling companies to build AI software people love.",
};

export default function Route() {
  return <SpCompany />;
}
