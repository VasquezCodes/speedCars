import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Firebase Admin requires Node.js APIs not available in Edge runtime
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
