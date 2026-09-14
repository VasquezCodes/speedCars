/**
 * Shrink a photo in the browser before it is uploaded.
 *
 * Phones and DSLRs hand us 4000-6000px files of 2-6 MB. Nothing on this site
 * ever displays a car larger than a full-screen lightbox, so storing the
 * original just makes every later read slower and more expensive. Re-encoding
 * to a 2400px WebP keeps the lightbox visually identical while cutting a
 * typical listing photo by roughly 95%.
 */

const MAX_EDGE = 2400;
const WEBP_QUALITY = 0.86;

export type DownscaleResult = {
    blob: Blob;
    name: string;
    type: string;
    originalBytes: number;
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
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
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { bitmap.close(); return untouched; }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
        let type = "image/webp";
        let ext = "webp";

        // Safari < 14 and some older Android webviews cannot encode WebP;
        // toBlob then hands back a PNG, which would be larger than the source.
        if (!blob || blob.type !== "image/webp") {
            blob = await canvasToBlob(canvas, "image/jpeg", 0.88);
            type = "image/jpeg";
            ext = "jpg";
        }

        if (!blob || blob.size >= file.size) return untouched;

        const base = file.name.replace(/[.][A-Za-z0-9]+$/, "") || "photo";
        return { blob, name: `${base}.${ext}`, type, originalBytes: file.size };
    } catch {
        return untouched;
    }
}
