/**
 * Pre-generated sizes of every vehicle photo, stored in R2 next to the
 * original. They replace Vercel's image optimizer, whose Hobby quota runs out
 * and then answers every uncached request with 402.
 *
 *   vehicles/<uuid>.jpg      original — the URL Firestore stores
 *   vehicles/<uuid>_w400     400px wide
 *   vehicles/<uuid>_w800     800px wide
 *   vehicles/<uuid>_w1600    1600px wide
 *
 * Variant keys carry no extension on purpose: browsers that cannot encode
 * WebP upload JPEG instead, and nothing that builds a URL should need to know
 * which. R2 serves the stored Content-Type.
 *
 * Written by the admin uploader (new photos) and by
 * scripts/generate-photo-variants.mjs (backfill). Keep this file free of
 * imports: the script loads it directly with Node.
 */

export const PHOTO_VARIANT_WIDTHS = [400, 800, 1600] as const;
export type PhotoVariantWidth = (typeof PHOTO_VARIANT_WIDTHS)[number];

const ORIGINAL_KEY = /^vehicles\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;
const ORIGINAL_URL = /^(https:\/\/[^/?#]+\/)(vehicles\/[^/?#]+)$/i;

export function isPhotoVariantWidth(width: number): width is PhotoVariantWidth {
    return (PHOTO_VARIANT_WIDTHS as readonly number[]).includes(width);
}

/** True for `vehicles/<uuid>.<ext>` — an uploaded original, not a variant. */
export function isOriginalPhotoKey(key: string): boolean {
    return ORIGINAL_KEY.test(key);
}

export function photoVariantKey(originalKey: string, width: PhotoVariantWidth): string {
    return `${originalKey.replace(/\.[a-z0-9]+$/i, "")}_w${width}`;
}

/**
 * Smallest variant at least `width` wide, give or take 10% — an 828px phone
 * gets the 800 one, which looks the same, instead of 1600. Past the largest
 * variant, the largest.
 */
export function photoVariantWidthFor(width: number): PhotoVariantWidth {
    return PHOTO_VARIANT_WIDTHS.find((w) => w >= width * 0.9) ?? PHOTO_VARIANT_WIDTHS[PHOTO_VARIANT_WIDTHS.length - 1];
}

/**
 * URL of the variant to show at `width` CSS-device pixels. Anything that is
 * not an R2 vehicle original (local assets, legacy hosts) comes back as-is.
 */
export function photoVariantUrl(src: string, width: number): string {
    const m = ORIGINAL_URL.exec(src);
    if (!m || !isOriginalPhotoKey(m[2])) return src;
    return m[1] + photoVariantKey(m[2], photoVariantWidthFor(width));
}
