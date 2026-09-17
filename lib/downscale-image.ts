/**
 * Shrink a photo in the browser before it is uploaded.
 *
 * Phones and DSLRs hand us 4000-6000px files of 2-6 MB. Nothing on this site
 * ever displays a car larger than a full-screen lightbox, so storing the
 * original just makes every later read slower and more expensive. Re-encoding
 * to a 2400px WebP keeps the lightbox visually identical while cutting a
 * typical listing photo by roughly 95%.
 *
 * The same pass renders the smaller sizes the site actually shows
 * (lib/photo-variants.ts), so no server ever has to resize anything.
 */

import { PHOTO_VARIANT_WIDTHS, type PhotoVariantWidth } from "./photo-variants";

const MAX_EDGE = 2400;
const WEBP_QUALITY = 0.86;
const VARIANT_WEBP_QUALITY = 0.8;

export type PhotoVariantBlob = {
    width: PhotoVariantWidth;
    blob: Blob;
    type: string;
};

export type DownscaleResult = {
    blob: Blob;
    name: string;
    type: string;
    originalBytes: number;
    /** Empty when the file could not be decoded; the site then shows the original. */
    variants: PhotoVariantBlob[];
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * WebP where the browser can encode it. Safari < 14 and some older Android
 * webviews cannot; toBlob then hands back a PNG, which would be larger than
 * the source, so fall back to JPEG.
 */
async function encode(canvas: HTMLCanvasElement, webpQuality: number): Promise<{ blob: Blob; type: string; ext: string } | null> {
    const webp = await canvasToBlob(canvas, "image/webp", webpQuality);
    if (webp?.type === "image/webp") return { blob: webp, type: "image/webp", ext: "webp" };
    const jpeg = await canvasToBlob(canvas, "image/jpeg", Math.min(0.88, webpQuality + 0.02));
    return jpeg ? { blob: jpeg, type: "image/jpeg", ext: "jpg" } : null;
}

function drawScaled(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement | null {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
}

/**
 * Returns the re-encoded file, or the original untouched when shrinking it
 * would not help (already small, unsupported format, decode failure). Never
 * throws — a failed optimisation must not block the upload.
 */
export async function downscaleImage(file: File): Promise<DownscaleResult> {
    const untouched: DownscaleResult = {
        blob: file,
        name: file.name,
        type: file.type || "image/jpeg",
        originalBytes: file.size,
        variants: [],
    };

    // Vector and animated sources must pass through as-is.
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
        return untouched;
    }

    try {
        // `from-image` applies the EXIF rotation, so portrait phone shots do
        // not come out sideways once the metadata is dropped.
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

        const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        const canvas = drawScaled(bitmap, Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
        bitmap.close();
        if (!canvas) return untouched;

        // Sized by width and never enlarged, exactly like
        // scripts/generate-photo-variants.mjs, so both produce the same set.
        const variants: PhotoVariantBlob[] = [];
        for (const width of PHOTO_VARIANT_WIDTHS) {
            const vScale = Math.min(1, width / canvas.width);
            const small = drawScaled(canvas, Math.round(canvas.width * vScale), Math.round(canvas.height * vScale));
            const encoded = small && await encode(small, VARIANT_WEBP_QUALITY);
            if (encoded) variants.push({ width, blob: encoded.blob, type: encoded.type });
        }

        const main = await encode(canvas, WEBP_QUALITY);
        if (!main || main.blob.size >= file.size) return { ...untouched, variants };

        const base = file.name.replace(/[.][A-Za-z0-9]+$/, "") || "photo";
        return { blob: main.blob, name: `${base}.${main.ext}`, type: main.type, originalBytes: file.size, variants };
    } catch {
        return untouched;
    }
}
