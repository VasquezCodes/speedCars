// scripts/clean-cloudinary-urls.mjs
//
// Elimina URLs de res.cloudinary.com del array images[] en todos los vehículos
// de Firestore. La cuenta de Cloudinary fue deshabilitada y esas URLs devuelven
// 401. Los vehículos que queden con images[] vacío mostrarán /placeholder-car.svg
// en el frontend automáticamente.
//
// Uso:
//   node scripts/clean-cloudinary-urls.mjs           # dry-run (no modifica nada)
//   node scripts/clean-cloudinary-urls.mjs --apply   # aplica los cambios

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "autosdealer-app";

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!getApps().length) {
  if (clientEmail && privateKey && !clientEmail.startsWith("FILL_IN")) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    const { applicationDefault } = await import("firebase-admin/app");
    initializeApp({ credential: applicationDefault(), projectId });
  }
}

const db = getFirestore();

const isCloudinary = (url) =>
  typeof url === "string" && url.includes("res.cloudinary.com");

console.log(
  `\n🧹 Limpiando URLs de Cloudinary en vehicles  (${APPLY ? "APPLY" : "DRY-RUN"})\n`,
);

const snap = await db.collection("vehicles").get();
console.log(`  Total vehículos: ${snap.size}\n`);

let vehiclesAffected = 0;
let urlsRemoved = 0;
let vehiclesEmptied = 0;
const batches = [];
let batch = db.batch();
let opsInBatch = 0;

for (const doc of snap.docs) {
  const data = doc.data();
  const original = Array.isArray(data.images) ? data.images : [];
  const cleaned = original.filter((u) => !isCloudinary(u));
  const removed = original.length - cleaned.length;

  if (removed === 0) continue;

  vehiclesAffected++;
  urlsRemoved += removed;
  if (cleaned.length === 0) vehiclesEmptied++;

  const label = `${data.year ?? "?"} ${data.brand ?? "?"} ${data.model ?? ""}`.trim();
  console.log(
    `  [${doc.id}] ${label}  →  ${original.length} → ${cleaned.length} imágenes (${removed} eliminadas)${cleaned.length === 0 ? "  ⚠ queda sin imágenes" : ""}`,
  );

  if (APPLY) {
    batch.update(doc.ref, { images: cleaned });
    opsInBatch++;
    if (opsInBatch >= 400) {
      batches.push(batch.commit());
      batch = db.batch();
      opsInBatch = 0;
    }
  }
}

if (APPLY && opsInBatch > 0) batches.push(batch.commit());
if (APPLY) await Promise.all(batches);

console.log(
  `\n📊 Resumen:
  Vehículos afectados:        ${vehiclesAffected}
  URLs de Cloudinary quitadas: ${urlsRemoved}
  Vehículos sin imágenes:     ${vehiclesEmptied}
`,
);

if (!APPLY) {
  console.log(
    "ℹ  Esto fue un DRY-RUN. Si el resultado se ve bien, volvé a correrlo con --apply para aplicar los cambios.\n",
  );
} else {
  console.log("✅ Cambios aplicados en Firestore.\n");
}
