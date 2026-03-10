import {
    getApps,
    initializeApp,
    cert,
    applicationDefault,
    App,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

function getAdminApp(): App {
    if (getApps().length > 0) return getApps()[0];

    const projectId =
        process.env.FIREBASE_ADMIN_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        "autosdealer-app";

    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    const hasExplicitCreds =
        clientEmail &&
        privateKey &&
        !clientEmail.startsWith("FILL_IN") &&
        !privateKey.startsWith("FILL_IN");

    if (hasExplicitCreds) {
        // Use service account credentials from .env.local
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail: clientEmail!,
                privateKey: privateKey!.replace(/\\n/g, "\n"),
            }),
        });
    }

    // Fall back to Application Default Credentials
    // Works when `gcloud auth application-default login` has been run locally,
    // or when deployed on Cloud Run / GCP infrastructure.
    return initializeApp({
        credential: applicationDefault(),
        projectId,
    });
}

function getAdminDb(): Firestore {
    if (_db) return _db;
    _db = getFirestore(getAdminApp());
    return _db;
}

export const adminDb = new Proxy({} as Firestore, {
    get(_target, prop) {
        const db = getAdminDb();
        const value = (db as any)[prop];
        return typeof value === "function" ? value.bind(db) : value;
    },
});
