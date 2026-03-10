import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendAdminNotification, sendSellerNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            phone,
            email,
            message,
            vehicleSlug,
            vehicleName,
            sellerCode,
            vehiclesViewed,
        } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Nombre y teléfono son requeridos" },
                { status: 400 }
            );
        }

        // Resolve seller info if code provided
        let sellerName: string | undefined;
        let sellerEmail: string | undefined;
        if (sellerCode) {
            const sellersSnap = await adminDb
                .collection("sellers")
                .where("code", "==", sellerCode)
                .limit(1)
                .get();
            if (!sellersSnap.empty) {
                const sellerDoc = sellersSnap.docs[0].data();
                sellerName = sellerDoc.name;
                sellerEmail = sellerDoc.email;
            }
        }

        // Save lead to Firestore
        const leadData = {
            name,
            phone,
            email: email || null,
            message: message || null,
            vehicleSlug: vehicleSlug || null,
            vehicleName: vehicleName || null,
            sellerCode: sellerCode || null,
            sellerName: sellerName || null,
            sellerEmail: sellerEmail || null,
            vehiclesViewed: vehiclesViewed || [],
            createdAt: new Date().toISOString(),
        };

        await adminDb.collection("leads").add(leadData);

        // Send email notifications (fire and forget — don't block response)
        sendAdminNotification({
            name,
            phone,
            email: email || undefined,
            message: message || undefined,
            vehicleSlug: vehicleSlug || undefined,
            vehicleName: vehicleName || undefined,
            sellerCode: sellerCode || undefined,
            sellerName: sellerName,
            sellerEmail: sellerEmail,
            vehiclesViewed: vehiclesViewed || [],
        }).catch(console.error);

        if (sellerCode && sellerEmail) {
            sendSellerNotification({
                name,
                phone,
                email: email || undefined,
                message: message || undefined,
                vehicleName: vehicleName || undefined,
                sellerCode: sellerCode,
                sellerName,
                sellerEmail,
                vehiclesViewed: vehiclesViewed || [],
            }).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating lead:", error);
        return NextResponse.json(
            { error: "Error al procesar la solicitud" },
            { status: 500 }
        );
    }
}
