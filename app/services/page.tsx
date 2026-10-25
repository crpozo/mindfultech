import type { Metadata } from "next";
import { ServicesPage } from "@/components/site/ServicesPage";

export const metadata: Metadata = {
  title: "Services: MindfulTech",
  description: "UX-driven software for humans and enterprises.",
};

export default function ServicesRoute() {
  return <ServicesPage />;
}
