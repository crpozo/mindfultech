import type { Metadata } from "next";
import { CbCompany } from "@/components/concepts/CerebriumPages";
export const metadata: Metadata = { title: "MindfulTech", robots: { index: false, follow: false } };
export default function Page() { return <CbCompany />; }
