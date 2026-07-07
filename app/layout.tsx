import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import { PageLoader } from "@/components/PageLoader";
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
});

export const metadata: Metadata = {
  title: "MindfulTech — Building the future with AI software",
  description:
    "Full-stack software lab, powered by UX research and applied AI. Human-centered products, built in Quito, Ecuador.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <body>
        {children}
        <PageLoader />
      </body>
    </html>
  );
}
