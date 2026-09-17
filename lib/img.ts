import type { SyntheticEvent } from "react";
import { photoVariantUrl } from "./photo-variants";

/**
 * URL for a plain <img> showing a vehicle photo at roughly `width` pixels:
 * the closest pre-generated size in R2 (lib/photo-variants.ts). next/image
 * gets the same through lib/image-loader.ts. Local assets and legacy hosts
 * come back unchanged.
 *
 * Pair it with fallbackToOriginal() in case that size was never generated.
 */
export function optimizedSrc(src: string, width: number): string {
    if (!src) return src;
    return photoVariantUrl(src, width);
}

/**
 * Props for a plain <img> pointed at optimizedSrc(): swaps to the original
 * once when that size cannot be loaded (for example, never generated).
 * next/image callers get the same from components/SafeImage.
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
