import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const { searchParams } = request.nextUrl;
    const ref = searchParams.get("ref");

    if (ref) {
        response.cookies.set("referral", ref, {
            maxAge: 60 * 60 * 24 * 15, // 15 days
            path: "/",
            httpOnly: false, // Must be readable by client JS
            sameSite: "lax",
        });
    }

    const { pathname } = request.nextUrl;
    const adminSession = request.cookies.get("admin_session");
    const sellerSession = request.cookies.get("seller_session");

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin") {
            if (adminSession) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }
        } else {
            if (!adminSession) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        }
    }

    // Seller routes protection
    if (pathname.startsWith("/seller")) {
        if (pathname === "/seller") {
            // Already logged in → go to dashboard
            if (sellerSession) {
                return NextResponse.redirect(new URL("/seller/dashboard", request.url));
            }
        } else {
            // Any /seller/* route (dashboard, etc.) → require session
            if (!sellerSession) {
                return NextResponse.redirect(new URL("/seller", request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
