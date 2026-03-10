import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const { searchParams } = request.nextUrl;
    const ref = searchParams.get("ref");

    if (ref) {
        // Set referral cookie for 30 days
        response.cookies.set("referral", ref, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
            httpOnly: false, // Must be readable by client JS
            sameSite: "lax",
        });
    }

    return response;
}

export const config = {
    matcher: [
        // Run on all routes except Next.js internals and static files
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
