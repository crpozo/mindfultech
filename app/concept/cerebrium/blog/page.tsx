import type { Metadata } from "next";
import { CbBlog } from "@/components/concepts/CerebriumPages";
export const metadata: Metadata = { title: "MindfulTech · Concepts · Cerebrium · Blog", robots: { index: false, follow: false } };
export default function Page() { return <CbBlog />; }
