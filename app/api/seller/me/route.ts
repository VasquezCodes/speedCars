import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySellerToken, SELLER_COOKIE_NAME } from "@/lib/seller-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SELLER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const session = await verifySellerToken(token);
  if (!session) return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });

  try {
    const sellerDoc = await adminDb.collection("sellers").doc(session.sellerId).get();
    if (!sellerDoc.exists || sellerDoc.data()?.isActive === false) {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const [viewsSnap, appointmentsSnap] = await Promise.all([
      adminDb.collection("pageViews").where("referrerId", "==", session.sellerId).orderBy("createdAt", "desc").get(),
      adminDb.collection("appointments").where("referrerId", "==", session.sellerId).orderBy("date", "desc").get(),
    ]);

    const uniqueVehicles = new Set(viewsSnap.docs.map((d) => d.data().vehicleId as string)).size;

    const appointments = appointmentsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? "",
        phone: d.phone ?? "",
        email: d.email ?? "",
        date: d.date ?? "",
        time: d.time ?? "",
        vehicleName: d.vehicleName ?? null,
        status: d.status ?? "pendiente",
        notes: d.notes ?? "",
        createdAt: typeof d.createdAt === "string"
          ? d.createdAt
          : d.createdAt?._seconds
          ? new Date(d.createdAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    // Recent page views with vehicle info (last 20)
    const recentViews = viewsSnap.docs.slice(0, 20).map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        vehicleId: d.vehicleId ?? "",
        vehicleName: d.vehicleName ?? null,
        createdAt: typeof d.createdAt === "string"
          ? d.createdAt
          : d.createdAt?._seconds
          ? new Date(d.createdAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      seller: session,
      stats: {
        totalViews: viewsSnap.size,
        totalAppointments: appointmentsSnap.size,
        uniqueVehicles,
      },
      appointments,
      recentViews,
    });
  } catch (error) {
    console.error("Seller me error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
