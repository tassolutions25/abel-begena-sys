import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This tells Next.js to keep Prisma out of the client-side bundle
  // and handle its binary correctly during build
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
