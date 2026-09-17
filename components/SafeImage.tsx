"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image that falls back to the untouched source when the optimizer
 * refuses a request. Once the Vercel Hobby image quota is spent, every
 * transformation that is not already cached comes back as 402, and a plain
 * next/image renders that as a broken icon until the quota resets.
 *
 * Drop-in replacement: same props as next/image.
 */
export default function SafeImage({ onError, unoptimized, ...props }: ImageProps) {
    const src = typeof props.src === "string" ? props.src : null;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showOriginal = src !== null && failedSrc === src;

    return (
        <NextImage
            {...props}
            unoptimized={unoptimized || showOriginal}
            onError={(e) => {
                // Only once per src: if the original also fails, stop there.
                if (src !== null && !showOriginal) setFailedSrc(src);
                onError?.(e);
            }}
        />
    );
}
