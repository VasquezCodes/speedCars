// scripts/clear-test-data.mjs
// Elimina todos los documentos de appointments, pageViews y leads

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env.local manualmente
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

async function deleteCollection(name) {
  const snap = await db.collection(name).limit(200).get();
  if (snap.empty) {
    console.log(`  ${name}: vacío, nada que borrar`);
    return 0;
  }
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  ${name}: ${snap.size} documentos eliminados`);
  return snap.size;
}

console.log("\n🧹 Limpiando datos de prueba...\n");

const collections = ["appointments", "pageViews", "leads"];
let total = 0;
for (const col of collections) {
  total += await deleteCollection(col);
}

console.log(`\n✅ Listo. Total eliminados: ${total} documentos.\n`);
