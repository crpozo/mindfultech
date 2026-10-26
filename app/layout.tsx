import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono, Instrument_Serif, JetBrains_Mono } from "next/font/google";
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

// display serif + label mono of the Oct 2026 redesign (see components/site)
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono", display: "swap", preload: false });

// English, like the page it describes: the site opens in English (see
// LanguageProvider) and the document title should match what loads.
const SITE_TITLE = "MindfulTech";
const OG_TITLE = "MindfulTech: AI systems designed for humans";
const SITE_DESC =
  "We understand your business and your systems, integrate them and apply AI where it genuinely saves time. First result in production within a week, with a person signing off where it matters. Quito, Ecuador.";

export const metadata: Metadata = {
  // absolute base for og:url / og:image on the static export
  metadataBase: new URL("https://mindfultech.ec"),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    siteName: "MindfulTech",
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_EC"],
    url: "/",
    title: OG_TITLE,
    description: SITE_DESC,
    // tarjeta social: el logo sobre el fondo claro del sitio, 1200×630, el
    // formato que WhatsApp, LinkedIn y X muestran completo. Generada con
    // Pillow a partir de la geometría de components/Logo.tsx y Outfit 600.
    images: [{ url: "/brand/og.png?v=5", width: 1200, height: 630, alt: "MindfulTech" }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: SITE_DESC,
    images: ["/brand/og.png?v=5"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable} ${serif.variable} ${jbmono.variable}`}>
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
