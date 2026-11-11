import type { Metadata } from "next";
import { SupplyDemo } from "@/components/supply/SupplyDemo";

export const metadata: Metadata = {
  title: "CommandInstinct · Delivery & licence command centre",
  description: "Demo: a live 3D yard where every supplier delivery is tracked from the licence gate to the customer, with permits checked on arrival.",
  // client demo, not for search engines
  robots: { index: false, follow: false },
};

export default function SupplyDemoPage() {
  return <SupplyDemo />;
}
