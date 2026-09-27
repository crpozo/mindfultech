import type { Metadata } from "next";
import { OfficeDemo } from "@/components/office/OfficeDemo";

export const metadata: Metadata = {
  title: "AI Management Office · MindfulTech",
  description: "Demo: a team of AI employees working in a 3D office. Click anyone to see their live screen and chat with them. Available in English and Spanish.",
  // client demo — not for search engines
  robots: { index: false, follow: false },
};

export default function OfficeDemoPage() {
  return <OfficeDemo />;
}
