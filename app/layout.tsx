import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/i18n";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  // mono only paints small labels — don't let its preload race the headline
  // font for bandwidth on a slow connection (the h1 swap is what sets LCP)
  preload: false,
});

const SITE_TITLE = "MindfulTech: Building the future with AI software";
const SITE_DESC =
  "Full-stack software lab, powered by UX research and applied AI. Human-centered products, built in Quito, Ecuador.";

export const metadata: Metadata = {
  // absolute base for og:url / og:image on the static export
  metadataBase: new URL("https://mindfultech.ec"),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    siteName: "MindfulTech",
    type: "website",
    locale: "en_US",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESC,
    // tarjeta social — el hero de producto que ya vive en /art
    images: [{ url: "/art/product.webp", width: 1200, height: 1020, alt: "MindfulTech" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/art/product.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          {children}
          {/* footer + WhatsApp + route loader on public pages, hidden on /tasks */}
          <SiteChrome />
        </LanguageProvider>
      </body>
    </html>
  );
}
