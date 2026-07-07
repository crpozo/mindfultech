import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { PlatformStats } from "@/components/home/PlatformStats";
import { FullStackLab } from "@/components/home/FullStackLab";
import { ResearchCarousel } from "@/components/home/ResearchCarousel";
import { ClientStories } from "@/components/home/ClientStories";
import { NewsGrid } from "@/components/home/NewsGrid";
import { ContactFooter } from "@/components/home/ContactFooter";
import { LiveChat } from "@/components/home/LiveChat";

export default function Home() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#fff" }}>
      <SiteHeader active="home" megaMenus ctaMode="form" />
      <Hero />
      <PlatformStats />
      <FullStackLab />
      <ResearchCarousel />
      <ClientStories />
      <NewsGrid />
      <ContactFooter />
      <LiveChat />
    </div>
  );
}
