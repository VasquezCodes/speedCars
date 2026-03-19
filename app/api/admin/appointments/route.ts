import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import {
    sendAppointmentCancellation,
    sendAppointmentCompleted,
} from "@/lib/email";
import type { AppointmentStatus, AdminAppointment } from "@/types/appointment";

async function checkAuth(): Promise<boolean> {
    const cookieStore = await cookies();
    return !!cookieStore.get("admin_session")?.value;
}

export async function GET() {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const snapshot = await adminDb
            .collection("appointments")
            .orderBy("date", "desc")
            .get();

        const appointments: AdminAppointment[] = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
                id: doc.id,
                date: d.date ?? "",
                time: d.time ?? "",
                name: d.name ?? "",
                phone: d.phone ?? "",
                email: d.email ?? "",
                notes: d.notes ?? "",
                referrerId: d.referrerId ?? "",
                vehicleId: d.vehicleId,
                vehicleName: d.vehicleName,
                sellerName: d.sellerName ?? null,
                sellerEmail: d.sellerEmail ?? null,
                status: (d.status as AppointmentStatus) ?? "pendiente",
                createdAt:
                    typeof d.createdAt === "string"
                        ? d.createdAt
                        : d.createdAt?._seconds
                        ? new Date(d.createdAt._seconds * 1000).toISOString()
                        : new Date().toISOString(),
            };
        });

        return NextResponse.json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Error al obtener turnos" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!(await checkAuth())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
        id: string;
        status?: AppointmentStatus;
        sellerId?: string;
    };
    const { id, status, sellerId } = body;

    if (!id) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Seller assignment
    if (sellerId !== undefined) {
        if (sellerId === "") {
            await adminDb.collection("appointments").doc(id).update({
                referrerId: "",
                sellerName: null,
                sellerEmail: null,
            });
        } else {
            const sellerDoc = await adminDb.collection("sellers").doc(sellerId).get();
            if (!sellerDoc.exists) {
                return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
            }
            await adminDb.collection("appointments").doc(id).update({
                referrerId: sellerId,
                sellerName: sellerDoc.data()?.name ?? null,
                sellerEmail: sellerDoc.data()?.email ?? null,
            });
        }
        return NextResponse.json({ success: true });
    }

    const validStatuses: AppointmentStatus[] = [
        "pendiente",
        "confirmado",
        "cancelado",
        "completado",
    ];
    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await adminDb.collection("appointments").doc(id).update({ status });

    // Fire emails on specific status transitions
    if (status === "cancelado" || status === "completado") {
        const doc = await adminDb.collection("appointments").doc(id).get();
        const d = doc.data();
        if (d?.email && d?.name) {
            const emailData = {
                clientName: d.name,
                clientEmail: d.email,
                clientPhone: d.phone ?? "",
                appointmentDate: d.date ?? "",
                appointmentTime: d.time ?? "",
                vehicleName: d.vehicleName,
                notes: d.notes,
                sellerName: d.sellerName,
                sellerEmail: d.sellerEmail,
            };
            if (status === "cancelado") {
                await sendAppointmentCancellation(emailData).catch(console.error);
            } else {
                await sendAppointmentCompleted(emailData).catch(console.error);
            }
        }
    }

    return NextResponse.json({ success: true });
}
