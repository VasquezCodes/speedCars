import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const brand = searchParams.get("brand");
        const type = searchParams.get("type");
        const maxPrice = searchParams.get("maxPrice");
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");

        // Use only a single where clause to avoid composite index requirements.
        // All secondary filters are applied in JavaScript.
        const snap = await adminDb
            .collection("vehicles")
            .where("isAvailable", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        let vehicles = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as any[];

        if (brand) vehicles = vehicles.filter((v) => v.brand === brand);
        if (type) vehicles = vehicles.filter((v) => v.type === type);
        if (featured === "true") vehicles = vehicles.filter((v) => v.isFeatured);
        if (maxPrice) vehicles = vehicles.filter((v) => v.price <= parseInt(maxPrice));
        if (search) {
            const q = search.toLowerCase();
            vehicles = vehicles.filter(
                (v) =>
                    v.brand?.toLowerCase().includes(q) ||
                    v.model?.toLowerCase().includes(q) ||
                    v.description?.toLowerCase().includes(q)
            );
        }

        return NextResponse.json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return NextResponse.json(
            { error: "Error al obtener vehículos" },
            { status: 500 }
        );
    }
}
