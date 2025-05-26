import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for Vercel deployment
  serverExternalPackages: ["@prisma/client"],
  // Configure for better Edge Runtime compatibility
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
