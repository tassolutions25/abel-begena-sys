import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This is required for Prisma in Next.js 15
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
