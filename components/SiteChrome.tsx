"use client";

import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";
import { ContactFooter } from "@/components/home/ContactFooter";
import { WhatsAppBubble } from "@/components/home/WhatsAppBubble";

/**
 * Marketing chrome (contact footer, WhatsApp bubble, route loader) shown on
 * every public page — but not on the private tools (/tasks, /finance,
 * /fitness), which are standalone app screens.
 */
const PRIVATE = ["/tasks", "/finance", "/fitness"];

export function SiteChrome() {
  const pathname = usePathname();
  if (PRIVATE.some((p) => pathname?.startsWith(p))) return null;
  return (
    <>
      <ContactFooter />
      <WhatsAppBubble />
      <PageLoader />
    </>
  );
}
