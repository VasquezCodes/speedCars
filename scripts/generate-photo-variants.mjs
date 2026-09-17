// scripts/generate-photo-variants.mjs
// Genera las miniaturas (_w400, _w800, _w1600) de cada foto original en R2.
// Ver lib/photo-variants.ts para el esquema de nombres.
//
// Idempotente: solo crea las que faltan y nunca modifica los originales, así
// que se puede volver a correr cuando haga falta (por ejemplo si una subida
// desde el admin no pudo guardar alguna miniatura).
//
//   node --env-file=.env.local scripts/generate-photo-variants.mjs [--dry-run] [--limit N] [--concurrency N]

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { writeFileSync } from "fs";
import { PHOTO_VARIANT_WIDTHS, isOriginalPhotoKey, photoVariantKey } from "../lib/photo-variants.ts";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
    const i = args.indexOf(name);
    return i === -1 ? fallback : Number(args[i + 1]);
};
const DRY_RUN = flag("--dry-run");
const LIMIT = option("--limit", Infinity);
const CONCURRENCY = option("--concurrency", 6);

const Bucket = process.env.R2_BUCKET_NAME;
if (!Bucket || !process.env.R2_ENDPOINT) {
    console.error("Faltan variables R2_*. Correr con: node --env-file=.env.local scripts/generate-photo-variants.mjs");
    process.exit(1);
}

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function listAllKeys() {
    const keys = [];
    let ContinuationToken;
    do {
        const page = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: "vehicles/", ContinuationToken }));
        for (const o of page.Contents ?? []) keys.push(o.Key);
        ContinuationToken = page.NextContinuationToken;
    } while (ContinuationToken);
    return keys;
}

async function generate(originalKey, widths) {
    const res = await s3.send(new GetObjectCommand({ Bucket, Key: originalKey }));
    const input = Buffer.from(await res.Body.transformToByteArray());

    // rotate() applies the EXIF orientation before the metadata is dropped.
    const base = sharp(input, { failOn: "none" }).rotate();
    let bytes = 0;
    for (const width of widths) {
        const body = await base
            .clone()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toBuffer();
        bytes += body.length;
        await s3.send(new PutObjectCommand({
            Bucket,
            Key: photoVariantKey(originalKey, width),
            Body: body,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable",
        }));
    }
    return { inputBytes: input.length, bytes };
}

const keys = await listAllKeys();
const existing = new Set(keys);
const originals = keys.filter(isOriginalPhotoKey);
const ignored = keys.filter((k) => !isOriginalPhotoKey(k) && !/_w\d+$/.test(k));

const todo = originals
    .map((key) => ({ key, widths: PHOTO_VARIANT_WIDTHS.filter((w) => !existing.has(photoVariantKey(key, w))) }))
    .filter((t) => t.widths.length > 0)
    .slice(0, LIMIT);

console.log(`objetos: ${keys.length} | originales: ${originals.length} | pendientes: ${todo.length}${Number.isFinite(LIMIT) ? ` (limit ${LIMIT})` : ""}`);
if (ignored.length) console.log(`ignorados (no son originales): ${ignored.join(", ")}`);
if (DRY_RUN) {
    for (const t of todo.slice(0, 10)) console.log("  ", t.key, "->", t.widths.join(","));
    process.exit(0);
}

const failures = [];
let done = 0, inputBytes = 0, outputBytes = 0;
const started = Date.now();

async function worker() {
    while (todo.length) {
        const { key, widths } = todo.shift();
        try {
            const r = await generate(key, widths);
            inputBytes += r.inputBytes;
            outputBytes += r.bytes;
        } catch (err) {
            failures.push({ key, error: err?.message ?? String(err) });
        }
        done++;
        if (done % 50 === 0) {
            const mins = ((Date.now() - started) / 60000).toFixed(1);
            console.log(`${done} listas en ${mins} min | fallidas: ${failures.length}`);
        }
    }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const mb = (n) => (n / 1048576).toFixed(0) + " MB";
console.log(`\nterminado: ${done} fotos en ${((Date.now() - started) / 60000).toFixed(1)} min`);
console.log(`leído ${mb(inputBytes)} de originales, escrito ${mb(outputBytes)} de miniaturas`);
console.log(`fallidas: ${failures.length}`);
if (failures.length) {
    writeFileSync("photo-variants-failures.json", JSON.stringify(failures, null, 2));
    for (const f of failures.slice(0, 10)) console.log("  ", f.key, "-", f.error);
    console.log("detalle en photo-variants-failures.json");
}
