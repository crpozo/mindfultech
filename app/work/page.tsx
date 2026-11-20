import type { Metadata } from "next";
import { SpWork } from "@/components/mt/SparkPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Case studies: real teams, measured outcomes.",
};

export default function Route() {
  return <SpWork />;
}
