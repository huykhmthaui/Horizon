import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "7uxk7rkotp.ufs.sh"
      }
    ]
  },
  experimental: {
    optimizeCss: true
  },
  devIndicators: false,
};

export default nextConfig;
