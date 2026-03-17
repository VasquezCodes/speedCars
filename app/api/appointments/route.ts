import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import {
    sendAppointmentClientConfirmation,
    sendAppointmentManagementNotification,
} from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            date,
            time,
            name,
            phone,
            email,
            notes,
            referrerId,
            vehicleId,
            vehicleName,
        } = body;

        if (!date || !time || !name || !phone || !email) {
            return NextResponse.json(
                { error: "Fecha, hora, nombre, teléfono y email son requeridos" },
                { status: 400 }
            );
        }

        // Resolve seller info from referrerId (Firestore document ID of the seller)
        let sellerName: string | undefined;
        let sellerEmail: string | undefined;
        if (referrerId) {
            const sellerDoc = await adminDb.collection("sellers").doc(referrerId).get();
            if (sellerDoc.exists) {
                sellerName = sellerDoc.data()?.name;
                sellerEmail = sellerDoc.data()?.email;
            }
        }

        // Save appointment to Firestore
        await adminDb.collection("appointments").add({
            date,
            time,
            name,
            phone,
            email,
            notes: notes ?? "",
            referrerId: referrerId ?? "",
            ...(vehicleId ? { vehicleId } : {}),
            ...(vehicleName ? { vehicleName } : {}),
            sellerName: sellerName ?? null,
            sellerEmail: sellerEmail ?? null,
            createdAt: new Date().toISOString(),
        });

        const emailData = {
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            appointmentDate: date,
            appointmentTime: time,
            notes: notes || undefined,
            vehicleName: vehicleName || undefined,
            sellerName,
            sellerEmail,
        };

        // Send emails (fire and forget — don't block response)
        sendAppointmentClientConfirmation(emailData).catch(console.error);
        sendAppointmentManagementNotification(emailData).catch(console.error);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            { error: "Error al procesar la solicitud" },
            { status: 500 }
        );
    }
}
