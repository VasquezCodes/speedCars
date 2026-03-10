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
        const snapshot = await adminDb
            .collection("vehicles")
            .orderBy("createdAt", "desc")
            .get();
        const vehicles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return NextResponse.json(vehicles);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const data = await request.json();
        const slug =
            data.slug ||
            `${data.brand}-${data.model}-${data.year}`
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

        const docRef = await adminDb.collection("vehicles").add({
            ...data,
            slug,
            isAvailable: data.isAvailable ?? true,
            isFeatured: data.isFeatured ?? false,
            images: data.images || [],
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: docRef.id, slug, success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
