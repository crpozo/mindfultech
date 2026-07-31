import type { MetadataRoute } from "next";

// Static export (GitHub Pages) — Next writes this out as /robots.txt at build.
// Allow-all: las páginas privadas (/tasks, /finance, /fitness, /fit) se
// protegen con meta noindex, no aquí — bloquearlas en robots impediría que los
// crawlers vean ese noindex.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://mindfultech.ec/sitemap.xml",
  };
}
