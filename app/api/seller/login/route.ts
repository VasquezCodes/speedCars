import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyPassword, createSellerToken, SELLER_COOKIE_NAME, SELLER_COOKIE_MAX_AGE } from "@/lib/seller-auth";
import type { SellerLoginBody, SellerSessionPayload } from "@/types/seller";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SellerLoginBody;
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    const snap = await adminDb
      .collection("sellers")
      .where("username", "==", username.toLowerCase().trim())
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const doc = snap.docs[0];
    const data = doc.data();
    const passwordHash = data.passwordHash as string;

    const valid = await verifyPassword(password, passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const payload: SellerSessionPayload = {
      sellerId: doc.id,
      username: data.username as string,
      name: data.name as string,
    };

    const token = await createSellerToken(payload);

    const response = NextResponse.json({ success: true, name: payload.name });
    response.cookies.set(SELLER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SELLER_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Seller login error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
