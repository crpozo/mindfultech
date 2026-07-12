import type { Metadata } from "next";
import { BlogBody } from "@/components/pages/BlogBody";

export const metadata: Metadata = {
  title: "Blog — MindfulTech",
  description: "Notes on research, engineering, and building AI people can trust.",
};

export default function BlogPage() {
  return <BlogBody />;
}
