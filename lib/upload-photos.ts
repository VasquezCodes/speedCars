/**
 * Send a batch of already-resized photos to R2 through presigned PUT URLs.
 *
 * Built for the slowest phone that uses the admin: on a 0.4-1 Mbps mobile
 * uplink, 18 photos take 5-10 minutes and some requests drop along the way.
 * So each photo stands on its own — one that fails never costs the others —
 * its original goes up before its copies, dropped connections are retried,
 * and the caller hears about every finished photo.
 *
 * Keep this file free of imports: Node loads it directly for tests.
 */

export type PhotoPut = { url: string; blob: Blob; type: string };

export type PhotoUpload = {
    name: string;
    /** What the vehicle stores once the original is in R2. */
    publicUrl: string;
    original: PhotoPut;
    /** The sizes the site displays (lib/photo-variants.ts). */
    copies: PhotoPut[];
};

export type UploadPhotosResult = {
    /** Public URLs of the photos whose original made it, in the order given. */
    uploaded: string[];
    failed: { name: string; error: string }[];
};

const CONCURRENCY = 3;
const ATTEMPTS = 3;

/** One PUT. Resolves to null on success, otherwise to the error and whether trying again could help. */
async function tryPut(target: PhotoPut, signal?: AbortSignal): Promise<{ error: Error; retry: boolean } | null> {
    let res: Response;
    try {
        res = await fetch(target.url, {
            method: "PUT",
            // Only Content-Type: the bucket's CORS rule allows no other
            // request header, and anything extra fails the preflight.
            headers: { "Content-Type": target.type },
            body: target.blob,
            signal,
        });
    } catch (err) {
        if (signal?.aborted) throw err;
        // The connection dropped ("Load failed" on Safari): worth another go.
        return { error: err instanceof Error ? err : new Error(String(err)), retry: true };
    }
    if (res.ok) return null;
    let body = "";
    try { body = await res.text(); } catch {}
    // 5xx is R2 having a moment; a 4xx (expired or bad signature) will not get better.
    return { error: new Error(`R2 respondió ${res.status}: ${body.slice(0, 200) || res.statusText}`), retry: res.status >= 500 };
}

async function put(target: PhotoPut, signal?: AbortSignal): Promise<void> {
    for (let attempt = 1; ; attempt++) {
        const failure = await tryPut(target, signal);
        if (!failure) return;
        if (!failure.retry || attempt === ATTEMPTS) throw failure.error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
}

/**
 * Rejects only when `signal` aborts (the form was closed); every other
 * failure is reported per photo in `failed`.
 */
export async function uploadPhotos(
    photos: PhotoUpload[],
    { signal, onProgress }: { signal?: AbortSignal; onProgress?: (done: number, total: number) => void },
): Promise<UploadPhotosResult> {
    const uploaded: (string | null)[] = photos.map(() => null);
    const errors: (string | null)[] = photos.map(() => null);
    let next = 0;
    let done = 0;

    // A few photos at a time, each finished before the next one starts. Firing
    // every PUT at once makes them all crawl together on a slow uplink, so no
    // photo is done until the very end.
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, photos.length) }, async () => {
        while (next < photos.length) {
            signal?.throwIfAborted();
            const i = next++;
            const photo = photos[i];
            try {
                await put(photo.original, signal);
                uploaded[i] = photo.publicUrl;
                // A missing copy only costs bandwidth — the page falls back to
                // the original — so it never fails the photo.
                await Promise.all(photo.copies.map((copy) => put(copy, signal).catch((err) => {
                    if (signal?.aborted) throw err;
                    console.warn("[upload] miniatura no guardada, se mostrará el original", { file: photo.name, error: String(err) });
                })));
            } catch (err) {
                if (signal?.aborted) throw err;
                errors[i] = err instanceof Error ? err.message : String(err);
            }
            onProgress?.(++done, photos.length);
        }
    }));

    return {
        uploaded: uploaded.filter((url): url is string => url !== null),
        failed: photos.flatMap((p, i) => (errors[i] === null ? [] : [{ name: p.name, error: errors[i] }])),
    };
}
