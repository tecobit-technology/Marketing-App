import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Use the focused TypeScript config during production builds
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },

  allowedDevOrigins: [
    "192.168.1.160",
    "192.168.1.72",
    "192.168.1.97",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;