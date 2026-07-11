/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export served at the domain root (https://mindfultech.ec via GitHub Pages)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
