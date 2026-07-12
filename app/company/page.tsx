import type { Metadata } from "next";
import { CompanyBody } from "@/components/pages/CompanyBody";

export const metadata: Metadata = {
  title: "Company — MindfulTech",
  description: "A software lab focused on people.",
};

export default function CompanyPage() {
  return <CompanyBody />;
}
