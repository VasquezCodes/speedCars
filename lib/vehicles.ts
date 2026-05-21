import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Vehicle } from "@/types/vehicle";

/**
 * Public inventory (available, non-retired), sorted newest-first.
 * Shared by the home page (ISR) and /api/vehicles (edge-cached), so neither
 * re-queries Firestore on every request.
 */
export async function getAvailableVehicles(): Promise<Vehicle[]> {
    const snap = await adminDb
        .collection("vehicles")
        .where("isAvailable", "==", true)
        .orderBy("createdAt", "desc")
        .get();

    return snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as Vehicle))
        // "Retirado" vehicles must never appear in the public catalog
        .filter((v) => v.status !== "Retirado");
}

/**
 * Purge the public ISR caches that render vehicle data so admin changes
 * (create / edit / delete) appear immediately. The catalog grid is served from
 * the /api/vehicles edge cache and refreshes within its short TTL.
 */
export function revalidateVehicleCaches() {
    // Never let a cache-revalidation hiccup fail the mutation itself — the
    // vehicle is already written to Firestore by the time we get here.
    try {
        revalidatePath("/");                      // home (ISR)
        revalidatePath("/autos");                 // catalog shell
        revalidatePath("/autos/[slug]", "page");  // all vehicle detail pages
    } catch (err) {
        console.error("[revalidateVehicleCaches] failed:", err);
    }
}
