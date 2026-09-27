import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  allowedDevOrigins: [
    "192.168.1.160",
    "192.168.1.72",
    "192.168.1.97",
  ],
};

export default nextConfig;