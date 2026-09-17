import type { SyntheticEvent } from "react";

/**
 * Vehicle photos are stored in R2 as untouched camera originals — commonly
 * 5000px wide and 2-6 MB. Nothing should ever put one of those in an <img>
 * directly. `next/image` handles that automatically wherever the layout suits
 * it; this helper covers the few places that need a plain <img> (intrinsic
 * sizing, canvas, etc.) by pointing at the same optimizer.
 *
 * `width` must be one of the sizes declared in next.config.ts, otherwise the
 * optimizer replies 400.
 */
export type OptimizedWidth = 32 | 64 | 96 | 128 | 256 | 384 | 640 | 750 | 828 | 1080 | 1200 | 1920;
export type OptimizedQuality = 70 | 78 | 85;

export function optimizedSrc(
    src: string,
    width: OptimizedWidth,
    quality: OptimizedQuality = 78,
): string {
    // Local assets (/placeholder-car.svg, /carBrands/*) are already small and
    // are not on the optimizer's allow-list.
    if (!src || src.startsWith("/") || src.startsWith("data:")) return src;
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * Props for a plain <img> pointed at optimizedSrc(): swaps to the original
 * once when the optimizer refuses (Vercel answers 402 after the Hobby image
 * quota is spent). next/image callers get the same from components/SafeImage.
 *
 *   <img src={optimizedSrc(url, 256)} {...fallbackToOriginal(url)} />
 */
export function fallbackToOriginal(original: string) {
    const swap = (img: HTMLImageElement) => {
        if (img.dataset.original === original) return;
        img.dataset.original = original;
        img.src = original;
    };
    return {
        onError: (e: SyntheticEvent<HTMLImageElement>) => swap(e.currentTarget),
        // A server-rendered <img> can fail before React attaches onError;
        // a broken image is already complete with no size once mounted.
        ref: (img: HTMLImageElement | null) => {
            if (img?.complete && img.naturalWidth === 0) swap(img);
        },
    };
}
