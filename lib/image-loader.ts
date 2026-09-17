"use client";

import { photoVariantUrl } from "./photo-variants";

/**
 * next/image loader (see images.loaderFile in next.config.ts). Vehicle photos
 * resolve to the pre-generated R2 sizes; nothing goes through Vercel's
 * optimizer, whose Hobby quota runs out. If a size is missing, SafeImage
 * falls back to the original.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
    return photoVariantUrl(src, width);
}
