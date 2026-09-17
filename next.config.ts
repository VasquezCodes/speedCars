import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's optimizer is not used: on the Hobby plan its quota runs out
    // and every uncached image then answers 402. Vehicle photos are resized
    // once, at upload, into R2 (lib/photo-variants.ts); local assets in
    // /public are already sized for where they are shown.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",

    // These still drive the srcset widths next/image asks the loader for.
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
