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

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const today = todayStr();

        // Parallel fetches
        const [
            vehiclesCountSnap,
            recentVehiclesSnap,
            appointmentsSnap,
            sellersSnap,
        ] = await Promise.all([
            adminDb.collection("vehicles").where("isAvailable", "==", true).count().get(),
            adminDb.collection("vehicles").limit(5).get(),
            adminDb.collection("appointments").orderBy("date", "desc").limit(100).get(),
            adminDb.collection("sellers").where("isActive", "==", true).count().get(),
        ]);

        const recentVehicles = recentVehiclesSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        // Process appointments
        const appointments = appointmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Array<{ id: string; date: string; time: string; name: string; vehicleName?: string; sellerName?: string; status: string; createdAt?: string }>;

        const todayAppointments = appointments.filter((a) => a.date === today);
        const pendingAppointments = appointments.filter((a) => a.status === "pendiente");
        const recentAppointments = appointments.slice(0, 5);

        return NextResponse.json({
            totalVehicles: vehiclesCountSnap.data().count,
            recentVehicles,
            todayAppointmentsCount: todayAppointments.length,
            pendingAppointmentsCount: pendingAppointments.length,
            recentAppointments,
            totalActiveSellers: sellersSnap.data().count,
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
