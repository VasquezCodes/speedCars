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
