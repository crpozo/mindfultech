import type { Metadata } from "next";
import { ServiceDetail } from "@/components/pages/ServiceDetail";

const META: Record<string, { name: string; desc: string }> = {
  ux: { name: "UX Design", desc: "Research-driven product design." },
  apps: { name: "Web & Mobile Apps", desc: "Scalable platforms on modern stacks." },
  custom: { name: "Custom Software", desc: "Software shaped around your workflows." },
  ai: { name: "AI & Automation", desc: "Grounded, human-reviewed AI." },
};

export function generateStaticParams() {
  return Object.keys(META).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = META[slug];
  return { title: `${m?.name ?? "Services"} — MindfulTech`, description: m?.desc };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
