import type { Metadata } from "next";
import { BlogPage } from "@/components/site/BlogPage";

export const metadata: Metadata = {
  title: "Blog: MindfulTech",
  description: "Notes on AI agents, engineering, and how MindfulTech builds software people trust: the AI Management Office, case studies, and our research playbook.",
};

export default function BlogRoute() {
  return <BlogPage />;
}
