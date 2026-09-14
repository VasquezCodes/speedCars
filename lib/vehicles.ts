import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Vehicle } from "@/types/vehicle";

export const VEHICLES_TAG = "vehicles";

/**
 * Last inventory we successfully read, kept per server instance.
 *
 * Firestore bills (and rate-limits) per document, so one uncached catalog
 * request costs one read per vehicle in the collection. Without this the
 * daily quota is reachable in a few hundred page views, and when it runs out
 * the catalog has nothing to show. Holding the last good copy means a
 * Firestore outage degrades to slightly stale prices instead of an empty lot.
 */
let lastGood: { vehicles: Vehicle[]; at: number } | null = null;

export function getLastGoodVehicles(): { vehicles: Vehicle[]; at: number } | null {
    return lastGood;
}

/**
 * Public inventory (available, non-retired), sorted newest-first.
 * Shared by the home page (ISR) and /api/vehicles (edge-cached), so neither
 * re-queries Firestore on every request.
 */
async function readAvailableVehicles(): Promise<Vehicle[]> {
    const snap = await adminDb
        .collection("vehicles")
        .where("isAvailable", "==", true)
        .orderBy("createdAt", "desc")
        .get();

    const vehicles = snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as Vehicle))
        // "Retirado" vehicles must never appear in the public catalog
        .filter((v) => v.status !== "Retirado");

    lastGood = { vehicles, at: Date.now() };
    return vehicles;
}

/**
 * Public inventory, read through Next's data cache: one Firestore query per
 * 5 minutes across all traffic instead of one per request. Admin mutations
 * call revalidateVehicleCaches(), so edits still show up immediately.
 */
export const getAvailableVehicles = unstable_cache(
    readAvailableVehicles,
    ["available-vehicles"],
    { revalidate: 300, tags: [VEHICLES_TAG] },
);

/**
 * Purge the public ISR caches that render vehicle data so admin changes
 * (create / edit / delete) appear immediately. The catalog grid is served from
 * the /api/vehicles edge cache and refreshes within its short TTL.
 */
export function revalidateVehicleCaches() {
    // Never let a cache-revalidation hiccup fail the mutation itself — the
    // vehicle is already written to Firestore by the time we get here.
    try {
        // expire: 0 drops the entry now, so an admin edit is visible on the
        // very next catalog request rather than after the 5-minute window.
        revalidateTag(VEHICLES_TAG, { expire: 0 });
        revalidatePath("/");                      // home (ISR)
        revalidatePath("/autos");                 // catalog shell
        revalidatePath("/autos/[slug]", "page");  // all vehicle detail pages
    } catch (err) {
        console.error("[revalidateVehicleCaches] failed:", err);
    }
}
