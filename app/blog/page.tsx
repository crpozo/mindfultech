import type { Metadata } from "next";
import { SpBlog } from "@/components/mt/SparkPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Notes on AI agents, engineering, and how MindfulTech builds software people trust.",
};

export default function Route() {
  return <SpBlog />;
}
