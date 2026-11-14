"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";

// Loaded after hydration, off the critical path: the contact modal (closed on load; openContact() requests made
// before it arrives are queued) and the light-page footer and bubble, which only /staging renders. Importing Shell
// statically put its 55KB stylesheet in front of the first paint of every page.
const ContactForm = dynamic(() => import("@/components/site/Shell").then((m) => m.ContactForm), { ssr: false });
const SiteFooter = dynamic(() => import("@/components/site/Shell").then((m) => m.SiteFooter));
const WhatsAppBubble = dynamic(() => import("@/components/home/WhatsAppBubble").then((m) => m.WhatsAppBubble));

/**
 * Marketing chrome (contact footer, WhatsApp bubble, route loader) shown on
 * every public page — but not on the private tools (/tasks, /finance,
 * /fitness) or the /office-demo client demo, which are standalone screens.
 */
const PRIVATE = ["/tasks", "/finance", "/fitness", "/office-demo", "/office-usfq", "/supply-demo", "/concepts", "/concept"];

export function SiteChrome() {
  const pathname = usePathname();
  if (PRIVATE.some((p) => pathname?.startsWith(p))) return null;
  const norm = (pathname || "/").replace(/\/+$/, "") || "/";
  const dark = !norm.startsWith("/staging");
  return (
    <>
      {!dark && <SiteFooter />}
      {!dark && <WhatsAppBubble />}
      <PageLoader />
      <ContactForm />
    </>
  );
}
