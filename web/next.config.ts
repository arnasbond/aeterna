import type { NextConfig } from "next";

const devOrigins = (process.env.NEXT_DEV_ORIGINS || "192.168.8.244,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigins,
  env: {
    NEXT_PUBLIC_BUILD_LABEL:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
      process.env.RENDER_GIT_COMMIT?.slice(0, 7) ||
      "local",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
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
