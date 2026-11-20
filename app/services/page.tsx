import type { Metadata } from "next";
import { SpServices } from "@/components/mt/SparkPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Cybersecurity, requirements workshops, custom software and AI agents. Four services, one team.",
};

export default function Route() {
  return <SpServices />;
}
