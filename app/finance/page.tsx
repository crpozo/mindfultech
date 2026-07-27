import type { Metadata } from "next";
import { FinanceApp } from "@/components/finance/FinanceApp";

export const metadata: Metadata = {
  title: "Finanzas · MindfulTech",
  // dashboard personal — fuera de los buscadores
  robots: { index: false, follow: false },
};

export default function FinancePage() {
  return <FinanceApp />;
}
