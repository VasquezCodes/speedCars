import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "Token requerido" }, { status: 400 });
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        
        // Require email verification or just accept it. We'll accept any valid token for now.
        // We can add role checks here later if we want to reject sign-in.
        
        const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days (máximo permitido por Firebase)
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true, role: decodedToken.role || 'user' });
        response.cookies.set("admin_session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn / 1000,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login route error", error);
        return NextResponse.json({ error: "Credenciales inválidas o expiradas" }, { status: 401 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_session");
    return response;
}
