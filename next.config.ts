import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Ensure proper runtime configuration
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
  // Configure for better Edge Runtime compatibility
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
