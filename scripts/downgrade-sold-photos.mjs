// scripts/downgrade-sold-photos.mjs
// Baja la calidad de las fotos de autos vendidos, para que el
// bucket de R2 no pase los 10 GB gratis. No borra nada ni cambia URLs.
// Corre solo el día 1 de cada mes (.github/workflows/downgrade-sold-photos.yml).
//
// Qué hace con cada foto (esquema en lib/photo-variants.ts):
//   - el original pasa a 1600px, JPEG calidad 70 (~200 KB en vez de ~450 KB)
//   - la copia _w1600 se reemplaza por esos mismos bytes
//   - _w400 y _w800 ya son chicas y no se tocan
// Cada objeto queda marcado con metadata "downgraded" y no se vuelve a procesar.
//
// "Vendido hace más de N días" = status "Vendido" y updatedAt (o createdAt) más
// viejo que N días. Marcar un auto como vendido actualiza updatedAt, y editar
// un auto ya vendido reinicia el plazo. N es 7 por defecto: nadie mira autos
// vendidos en detalle, y la semana es solo margen por si se marcó por error.
//
//   node --env-file=.env.local scripts/downgrade-sold-photos.mjs [--dry-run] [--min-age-days 7] [--limit-vehicles N]

import { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sharp from "sharp";
import { isOriginalPhotoKey, photoVariantKey } from "../lib/photo-variants.ts";

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const i = args.indexOf(name);
    return i === -1 ? fallback : Number(args[i + 1]);
};
const DRY_RUN = args.includes("--dry-run");
const MIN_AGE_DAYS = option("--min-age-days", 7);
const LIMIT_VEHICLES = option("--limit-vehicles", Infinity);
const CONCURRENCY = 4;

const Bucket = process.env.R2_BUCKET_NAME;
const missing = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"]
    .filter((k) => !process.env[k]);
if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(", ")}`);
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

initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "autosdealer-app",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
});
const db = getFirestore();

function toMillis(value) {
    if (!value) return NaN;
    if (typeof value === "string") return Date.parse(value);
    if (typeof value.toMillis === "function") return value.toMillis();
    return NaN;
}

/** `vehicles/<uuid>.<ext>` for an R2 original URL, otherwise null (legacy hosts, local files). */
function originalKeyOf(url) {
    try {
        const key = new URL(url).pathname.slice(1);
        return isOriginalPhotoKey(key) ? key : null;
    } catch {
        return null;
    }
}

async function downgrade(originalKey) {
    let head;
    try {
        head = await s3.send(new HeadObjectCommand({ Bucket, Key: originalKey }));
    } catch (err) {
        if (err?.$metadata?.httpStatusCode === 404) return "missing";
        throw err;
    }
    if (head.Metadata?.downgraded) return "already";

    const res = await s3.send(new GetObjectCommand({ Bucket, Key: originalKey }));
    const input = Buffer.from(await res.Body.transformToByteArray());
    const output = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 70, mozjpeg: true })
        .toBuffer();

    // A photo that was already tiny keeps its bytes; it still gets marked.
    const smaller = output.length < input.length;
    const body = smaller ? output : input;
    const put = (Key) => s3.send(new PutObjectCommand({
        Bucket,
        Key,
        Body: body,
        ContentType: smaller ? "image/jpeg" : head.ContentType,
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: { downgraded: new Date().toISOString().slice(0, 10) },
    }));
    await put(originalKey);
    await put(photoVariantKey(originalKey, 1600));
    return { before: input.length, after: body.length };
}

const cutoff = Date.now() - MIN_AGE_DAYS * 24 * 60 * 60 * 1000;
const snap = await db.collection("vehicles")
    .where("status", "==", "Vendido")
    .select("brand", "model", "year", "images", "updatedAt", "createdAt")
    .get();

const eligible = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((v) => toMillis(v.updatedAt ?? v.createdAt) < cutoff)
    .slice(0, LIMIT_VEHICLES);

const photos = eligible.flatMap((v) => (v.images ?? []).map(originalKeyOf).filter(Boolean));
console.log(`vendidos: ${snap.size} | vendidos hace más de ${MIN_AGE_DAYS} días: ${eligible.length} | fotos en R2: ${photos.length}`);

if (DRY_RUN) {
    for (const v of eligible.slice(0, 20)) console.log(`   ${v.year} ${v.brand} ${v.model} (${(v.images ?? []).length} fotos)`);
    console.log("--dry-run: no se cambió nada");
    process.exit(0);
}

const stats = { downgraded: 0, already: 0, missing: 0, failed: [], before: 0, after: 0 };
const queue = [...photos];
async function worker() {
    while (queue.length) {
        const key = queue.shift();
        try {
            const r = await downgrade(key);
            if (r === "already" || r === "missing") stats[r]++;
            else { stats.downgraded++; stats.before += r.before; stats.after += r.after; }
        } catch (err) {
            stats.failed.push(`${key}: ${err?.message ?? err}`);
        }
    }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const mb = (n) => (n / 1048576).toFixed(0) + " MB";
console.log(`procesadas: ${stats.downgraded} (${mb(stats.before)} -> ${mb(stats.after)} por original, lo mismo en su copia 1600)`);
console.log(`ya estaban: ${stats.already} | no encontradas: ${stats.missing} | fallidas: ${stats.failed.length}`);
for (const f of stats.failed.slice(0, 20)) console.log("   ", f);
if (stats.failed.length) process.exit(1);
