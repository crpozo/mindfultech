import type { Metadata } from "next";
import { SupplyDemo } from "@/components/supply/SupplyDemo";

export const metadata: Metadata = {
  title: "Command Instinct · Node-level compliance execution",
  description: "Demo: a live 3D transit node where every shipment is resolved against its OFAC general license. Pass, fail, and the compliant substitute that moves instead.",
  // client demo, not for search engines
  robots: { index: false, follow: false },
};

export default function SupplyDemoPage() {
  return <SupplyDemo />;
}
