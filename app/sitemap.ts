import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog/posts";

// Static export (GitHub Pages) — Next writes this out as /sitemap.xml at build.
// Solo datos estáticos: los slugs del blog vienen del mismo módulo que usa
// generateStaticParams, así que la lista nunca se desincroniza.
export const dynamic = "force-static";

const BASE = "https://mindfultech.ec";

// mirrors the META keys in app/services/[slug]/page.tsx
const SERVICE_SLUGS = ["ux", "apps", "custom", "ai"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Public routes only — /tasks, /finance, /fitness and /fit are private
  // (noindex) and stay out on purpose.
  const routes = [
    "",
    "/work",
    "/services",
    ...SERVICE_SLUGS.map((s) => `/services/${s}`),
    "/company",
    "/blog",
    ...POSTS.map((p) => `/blog/${p.slug}`),
  ];

  // trailingSlash: true en next.config — las URLs publicadas terminan en "/"
  return routes.map((path) => ({ url: `${BASE}${path}/` }));
}
