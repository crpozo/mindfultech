import type { Metadata } from "next";
import { ServicesBody } from "@/components/pages/ServicesBody";

export const metadata: Metadata = {
  title: "Services — MindfulTech",
  description: "UX-driven software for humans and enterprises.",
};

export default function ServicesPage() {
  return <ServicesBody />;
}
