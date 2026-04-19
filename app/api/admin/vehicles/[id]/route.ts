import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

import { adminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function isAuthenticated(request: NextRequest) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
        console.error("[auth] admin_session cookie ausente");
        return false;
    }
    try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        return true;
    } catch (err: any) {
        console.error("[auth] verifySessionCookie falló:", {
            code: err?.code,
            message: err?.message,
        });
        return false;
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const isAuth = await isAuthenticated(request);
    if (!isAuth) {
        console.error("[vehicles PUT] 401 — sesión admin inválida o ausente");
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    let id: string | undefined;
    try {
        ({ id } = await params);
        const data = await request.json();

        // Strip fields that must not be overwritten
        const { id: _discardId, createdAt: _discardCreated, ...rest } = data ?? {};

        console.log("[vehicles PUT] id=%s keys=%o imagesCount=%d", id, Object.keys(rest), Array.isArray(rest.images) ? rest.images.length : -1);

        await adminDb.collection("vehicles").doc(id!).update({
            ...rest,
            updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[vehicles PUT] fallo id=%s:", id, {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
        });
        return NextResponse.json(
            { error: error?.message || "Error interno", code: error?.code ?? null },
            { status: 500 },
        );
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
