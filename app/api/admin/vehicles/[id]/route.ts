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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const data = await request.json();
        await adminDb.collection("vehicles").doc(id).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const { id } = await params;
        await adminDb.collection("vehicles").doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
