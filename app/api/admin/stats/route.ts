import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

import { adminAuth } from "@/lib/firebase/admin";

async function isAuthenticated(request: NextRequest) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) return false;
    try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        return true;
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const vehiclesSnap = await adminDb
            .collection("vehicles")
            .where("isAvailable", "==", true)
            .count()
            .get();

        // Recientes (ultimos 5 agregados o disponibles)
        const recentVehiclesSnap = await adminDb
            .collection("vehicles")
            .limit(5)
            .get();

        const recentVehicles = recentVehiclesSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        return NextResponse.json({
            totalVehicles: vehiclesSnap.data().count,
            recentVehicles,
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
