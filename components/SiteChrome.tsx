"use client";

import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";
import { ContactFooter } from "@/components/home/ContactFooter";
import { WhatsAppBubble } from "@/components/home/WhatsAppBubble";

/**
 * Marketing chrome (contact footer, WhatsApp bubble, route loader) shown on
 * every public page — but not on the private /tasks board, which is a
 * standalone app screen.
 */
export function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/tasks")) return null;
  return (
    <>
      <ContactFooter />
      <WhatsAppBubble />
      <PageLoader />
    </>
  );
}
