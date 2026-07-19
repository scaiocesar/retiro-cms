import type { NextConfig } from "next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((origin) => origin.trim())
  : ["192.168.1.153", "192.168.1.153:3000", "192.168.*", "10.*", "172.*"];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
    {
      source: "/manifest.webmanifest",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json",
        },
      ],
    },
  ],
};

export default nextConfig;
