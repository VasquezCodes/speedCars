import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySellerToken, SELLER_COOKIE_NAME } from "@/lib/seller-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SELLER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const session = await verifySellerToken(token);
  if (!session) return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });

  try {
    // Verify seller document still exists (guards against deleted sellers with valid JWTs)
    const sellerDoc = await adminDb.collection("sellers").doc(session.sellerId).get();
    if (!sellerDoc.exists) {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const [viewsSnap, appointmentsSnap] = await Promise.all([
      adminDb.collection("pageViews").where("referrerId", "==", session.sellerId).get(),
      adminDb.collection("appointments").where("referrerId", "==", session.sellerId).get(),
    ]);

    const uniqueVehicles = new Set(viewsSnap.docs.map((d) => d.data().vehicleId as string)).size;

    return NextResponse.json({
      seller: session,
      stats: {
        totalViews: viewsSnap.size,
        totalAppointments: appointmentsSnap.size,
        uniqueVehicles,
      },
    });
  } catch (error) {
    console.error("Seller me error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
