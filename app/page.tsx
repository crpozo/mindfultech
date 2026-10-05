import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { PlatformStats } from "@/components/home/PlatformStats";
import { AiOffice } from "@/components/home/AiOffice";
import { FullStackLab } from "@/components/home/FullStackLab";
import { ProcessFlow } from "@/components/home/ProcessFlow";
import { ClientStories } from "@/components/home/ClientStories";
import { ClientMap } from "@/components/home/ClientMap";

export default function Home() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "clip", background: "#fff" }}>
      {/* Header sits outside the fold so position:sticky can escape it. */}
      <SiteHeader active="home" megaMenus blueBg ctaMode="form" />
      <main>
        {/* Hero fills the rest of the first viewport — no white peeks in. */}
        <div style={{ minHeight: "max(560px, calc(100vh - 104px))", display: "flex", flexDirection: "column" }}>
          <Hero />
        </div>
        <PlatformStats />
        <FullStackLab />
        <ProcessFlow />
        <ClientStories />
        {/* our own product, apart from the services: it follows the projects we built */}
        <AiOffice />
        <ClientMap />
      </main>
    </div>
  );
}
