import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

function isAuthenticated(request: NextRequest) {
    const cookieStore = request.cookies;
    return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { searchParams } = request.nextUrl;
        const sellerCode = searchParams.get("sellerCode");
        const vehicleSlug = searchParams.get("vehicleSlug");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");

        // Single orderBy, no composite index needed
        const snapshot = await adminDb
            .collection("leads")
            .orderBy("createdAt", "desc")
            .get();

        let leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

        if (sellerCode) leads = leads.filter((l) => l.sellerCode === sellerCode);
        if (vehicleSlug) leads = leads.filter((l) => l.vehicleSlug === vehicleSlug);
        if (dateFrom) leads = leads.filter((l) => l.createdAt >= dateFrom);
        if (dateTo) leads = leads.filter((l) => l.createdAt <= dateTo + "T23:59:59");

        return NextResponse.json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
