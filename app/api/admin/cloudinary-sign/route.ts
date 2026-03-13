import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("admin_session")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        await adminAuth.verifySessionCookie(sessionCookie, true);

        // next-cloudinary sends the params it needs signed in the body.
        const body = await req.json();
        
        // Remove `signature` if it exists (although it shouldn't be sent) to avoid signing a signature and `api_key`.
        // We only sign the parameters actually sent.
        const { paramsToSign } = body;
        
        if (!paramsToSign) {
            return NextResponse.json({ error: "No params to sign" }, { status: 400 });
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET as string
        );

        return NextResponse.json({ signature });
    } catch (error) {
        console.error("Signature error:", error);
        return NextResponse.json({ error: "No autorizado o error interno" }, { status: 401 });
    }
}
