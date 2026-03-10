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
            .collection("sellers")
            .orderBy("createdAt", "desc")
            .get();
        const sellers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(sellers);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const { name, code, email } = await request.json();
        if (!name || !code) {
            return NextResponse.json(
                { error: "Nombre y código son requeridos" },
                { status: 400 }
            );
        }
        // Check code uniqueness
        const existing = await adminDb
            .collection("sellers")
            .where("code", "==", code)
            .get();
        if (!existing.empty) {
            return NextResponse.json(
                { error: "El código ya está en uso" },
                { status: 400 }
            );
        }
        const docRef = await adminDb.collection("sellers").add({
            name,
            code: code.toLowerCase().replace(/\s+/g, "_"),
            email: email || null,
            createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ id: docRef.id, success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    try {
        const { id } = await request.json();
        await adminDb.collection("sellers").doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
