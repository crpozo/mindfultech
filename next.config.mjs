/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export served at the domain root (https://mindfultech.ec via GitHub Pages)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // No inlineCss: the stylesheets grew to ~160KB and Next inlines them twice
  // (in <style> and again in the RSC payload), on every page and every client
  // navigation. As external files they are fetched once and cached.
};

export default nextConfig;
