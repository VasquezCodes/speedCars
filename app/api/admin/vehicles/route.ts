import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

import { adminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

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
        const snapshot = await adminDb
            .collection("vehicles")
            .orderBy("createdAt", "desc")
            .get();
        const vehicles = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
            };
        });
        return NextResponse.json(vehicles);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
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
            status: data.status || "Disponible",
            isFeatured: data.isFeatured ?? false,
            images: data.images || [],
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: docRef.id, slug, success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
