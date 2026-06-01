import type { NextConfig } from "next";

const devOrigins = (process.env.NEXT_DEV_ORIGINS || "192.168.8.244,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigins,
  async rewrites() {
    const api = process.env.API_INTERNAL_URL?.replace(/\/$/, "");
    if (!api) return [];
    return [
      { source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` },
      { source: "/health", destination: `${api}/health` },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
