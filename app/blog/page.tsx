import type { Metadata } from "next";
import { CbBlog } from "@/components/concepts/CerebriumPages";

export const metadata: Metadata = {
  title: "MindfulTech",
  description: "Notes on AI agents, engineering, and how MindfulTech builds software people trust.",
};

export default function Route() {
  return <CbBlog />;
}
