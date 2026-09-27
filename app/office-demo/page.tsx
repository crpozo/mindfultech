import type { Metadata } from "next";
import { OfficeDemo } from "@/components/office/OfficeDemo";

export const metadata: Metadata = {
  title: "Oficina de empleados IA · MindfulTech",
  description:
    "Demo: un equipo de empleados IA trabajando en una oficina 3D. Haz clic en cada uno para hablar con él y ver su pantalla en vivo.",
  // client demo — not for search engines
  robots: { index: false, follow: false },
};

export default function OfficeDemoPage() {
  return <OfficeDemo />;
}
