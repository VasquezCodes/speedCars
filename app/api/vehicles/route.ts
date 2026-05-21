import { NextResponse } from "next/server";
import { getAvailableVehicles } from "@/lib/vehicles";

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
        return NextResponse.json(
            { error: "Error al obtener vehículos" },
            { status: 500 }
        );
    }
}
