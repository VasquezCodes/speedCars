import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { vehicleSlug, vehicleName, sellerCode } = body;

        await adminDb.collection("whatsappClicks").add({
            vehicleSlug: vehicleSlug || null,
            vehicleName: vehicleName || null,
            sellerCode: sellerCode || null,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging WhatsApp click:", error);
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}
