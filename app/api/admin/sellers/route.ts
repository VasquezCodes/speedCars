import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/seller-auth";
import type { SellerRecord, CreateSellerBody } from "@/types/seller";
import type { Timestamp } from "firebase-admin/firestore";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!sessionCookie) return false;
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const snap = await adminDb.collection("sellers").orderBy("createdAt", "desc").get();
    const sellers: SellerRecord[] = snap.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username as string,
      name: doc.data().name as string,
      email: (doc.data().email as string | undefined) ?? undefined,
      isActive: (doc.data().isActive as boolean) ?? true,
      createdAt: doc.data().createdAt as Timestamp,
    }));
    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("Sellers GET error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as CreateSellerBody;
    const { name, username, password, email } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Nombre, usuario y contraseña son requeridos" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, "");

    const existing = await adminDb
      .collection("sellers")
      .where("username", "==", cleanUsername)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: "El nombre de usuario ya existe" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const docRef = await adminDb.collection("sellers").add({
      username: cleanUsername,
      name: name.trim(),
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      passwordHash,
      isActive: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Sellers POST error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
