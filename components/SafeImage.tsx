"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image that falls back to the untouched source when the resized copy
 * cannot be loaded — a photo whose R2 sizes were never generated, or (before
 * lib/image-loader.ts) Vercel's optimizer answering 402 once the Hobby quota
 * was spent. A plain next/image renders either as a broken icon.
 *
 * Files from /public are served as they are: they are already sized for
 * where they appear, and the loader has nothing to resize them into.
 *
 * Drop-in replacement: same props as next/image.
 */
export default function SafeImage({ onError, unoptimized, ...props }: ImageProps) {
    const src = typeof props.src === "string" ? props.src : null;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showOriginal = src !== null && failedSrc === src;
    const isLocalAsset = src?.startsWith("/") ?? false;

    return (
        <NextImage
            {...props}
            unoptimized={unoptimized || isLocalAsset || showOriginal}
            onError={(e) => {
                // Only once per src: if the original also fails, stop there.
                if (src !== null && !showOriginal) setFailedSrc(src);
                onError?.(e);
            }}
        />
    );
}
