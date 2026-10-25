import type { Metadata } from "next";
import { CompanyPage } from "@/components/site/CompanyPage";

export const metadata: Metadata = {
  title: "Company: MindfulTech",
  description: "A software lab focused on people.",
};

export default function CompanyRoute() {
  return <CompanyPage />;
}
