import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { PlatformStats } from "@/components/home/PlatformStats";
import { FullStackLab } from "@/components/home/FullStackLab";
import { ProcessFlow } from "@/components/home/ProcessFlow";
import { ClientStories } from "@/components/home/ClientStories";
import { NewsGrid } from "@/components/home/NewsGrid";
import { ContactFooter } from "@/components/home/ContactFooter";
import { WhatsAppBubble } from "@/components/home/WhatsAppBubble";

export default function Home() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      {/* Header sits outside the fold so position:sticky can escape it. */}
      <SiteHeader active="home" megaMenus blueBg ctaMode="form" />
      {/* Hero fills the rest of the first viewport — no white peeks in. */}
      <div style={{ minHeight: "max(560px, calc(100vh - 150px))", display: "flex", flexDirection: "column" }}>
        <Hero />
      </div>
      <PlatformStats />
      <FullStackLab />
      <ProcessFlow />
      <ClientStories />
      <NewsGrid />
      <ContactFooter />
      <WhatsAppBubble />
    </div>
  );
}
