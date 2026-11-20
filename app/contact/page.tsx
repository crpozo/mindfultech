import type { Metadata } from "next";
import { SpContact } from "@/components/mt/SparkPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Tell us what you want to automate. Write through the form, WhatsApp or email.",
};

export default function Route() {
  return <SpContact />;
}
