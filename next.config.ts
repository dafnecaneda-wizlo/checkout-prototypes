import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: "standalone",
  images: { unoptimized: true },
};

export default nextConfig;
