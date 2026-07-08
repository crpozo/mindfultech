/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages (served at https://crpozo.github.io/mindfultech/)
  output: "export",
  basePath: "/mindfultech",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
