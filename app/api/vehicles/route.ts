import { NextResponse } from "next/server";
import { getAvailableVehicles, getLastGoodVehicles } from "@/lib/vehicles";

// Returns the full public inventory (available, non-retired). Filtering and
// fuzzy search now run in the browser (see CatalogContent), so this endpoint
// serves one cacheable payload instead of one DB query per filter change.
export async function GET() {
    try {
        const vehicles = await getAvailableVehicles();
        return NextResponse.json(vehicles, {
            headers: {
                // Edge-cache so repeat catalog loads are served without re-invoking
                // the function; stale-while-revalidate keeps responses instant.
                "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error);

        // Firestore is unreachable or over quota. Showing an empty catalog
        // here reads to a customer as "this dealership has no cars", so serve
        // the last inventory we managed to read if we still have one.
        const stale = getLastGoodVehicles();
        if (stale) {
            return NextResponse.json(stale.vehicles, {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
                    "X-Inventory-Stale": String(Date.now() - stale.at),
                },
            });
        }

        // Nothing cached to fall back on. 503 tells the client this is an
        // outage, not an empty lot.
        return NextResponse.json(
            { error: "inventory_unavailable" },
            { status: 503, headers: { "Cache-Control": "no-store" } }
        );
    }
}
