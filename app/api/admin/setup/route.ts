import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET() {
    try {
        const email = "admin@speedcars.com";
        const password = "password123";

        try {
            const user = await adminAuth.getUserByEmail(email);
            return NextResponse.json({ message: "Admin user already exists", uid: user.uid });
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                const userRecord = await adminAuth.createUser({
                    email,
                    password,
                    emailVerified: true,
                });
                return NextResponse.json({ 
                    message: "Admin user created successfully", 
                    email: userRecord.email,
                    password: password 
                });
            }
            throw e;
        }
    } catch (error: any) {
        console.error("Setup error:", error);
        return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
}
