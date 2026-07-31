/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export served at the domain root (https://mindfultech.ec via GitHub Pages)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The 14KB stylesheet was the last render-blocking request; inlining it
  // saves a round trip on every page (GitHub Pages, no HTTP push available).
  experimental: { inlineCss: true },
};

export default nextConfig;
