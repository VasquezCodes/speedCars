import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

function isAuthenticated(request: NextRequest) {
    return request.cookies.get("admin_session")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const [leadsSnap, vehiclesSnap, clicksSnap, sellersSnap] =
            await Promise.all([
                adminDb.collection("leads").count().get(),
                adminDb
                    .collection("vehicles")
                    .where("isAvailable", "==", true)
                    .count()
                    .get(),
                adminDb.collection("whatsappClicks").count().get(),
                adminDb.collection("sellers").count().get(),
            ]);

        // Recent leads (last 5)
        const recentLeadsSnap = await adminDb
            .collection("leads")
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        const recentLeads = recentLeadsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({
            totalLeads: leadsSnap.data().count,
            totalVehicles: vehiclesSnap.data().count,
            totalClicks: clicksSnap.data().count,
            totalSellers: sellersSnap.data().count,
            recentLeads,
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
