import type { NextConfig } from "next";

// Vehicle photos live in one public R2 bucket (see app/api/admin/upload).
// Deriving the host from the same env var the uploader writes keeps the two
// from drifting apart.
const r2Host = (() => {
  try {
    return new URL(process.env.R2_PUBLIC_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Scoped to our own bucket on purpose: a wildcard host turns /_next/image
    // into an open resize-proxy for the whole internet, billed to us.
    remotePatterns: r2Host
      ? [{ protocol: "https", hostname: r2Host }]
      : [{ protocol: "https", hostname: "**" }],

    // Originals are 4-6 MB camera files; these two lines are what turn a
    // 5333x4000 JPEG into a ~17 KB WebP for a 320px card.
    formats: ["image/avif", "image/webp"],
    qualities: [70, 78, 85],

    // Keys are content-addressed UUIDs, so a derivative never goes stale.
    minimumCacheTTL: 31536000,

    // No screen on this site shows a car wider than 1920, and every extra
    // entry is another transformation to pay for and cache.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 64, 96, 128, 256, 384],
  },

  // Firebase Admin requires Node.js APIs not available in Edge runtime
  serverExternalPackages: ["firebase-admin"],

  async headers() {
    return [
      {
        source: "/:path*.mp4",
        headers: [
          { key: "Content-Type", value: "video/mp4" },
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
