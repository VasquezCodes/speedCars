import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { QuerySnapshot } from "firebase-admin/firestore";
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

    const sellerId = sellerDoc.id;

    // Queries may fail if Firestore indexes are missing — don't block seller info
    let viewsSnap: QuerySnapshot | null = null;
    let appointmentsSnap: QuerySnapshot | null = null;
    try {
      [viewsSnap, appointmentsSnap] = await Promise.all([
        adminDb.collection("pageViews").where("referrerId", "==", sellerId).get(),
        adminDb.collection("appointments").where("referrerId", "==", sellerId).get(),
      ]);
    } catch (queryErr) {
      console.error("Seller me — query error (missing index?):", queryErr);
    }

    const uniqueVehicles = viewsSnap
      ? new Set(viewsSnap.docs.map((d) => d.data().vehicleId as string)).size
      : 0;

    const appointments = appointmentsSnap
      ? appointmentsSnap.docs
        .sort((a, b) => ((b.data().date ?? "") > (a.data().date ?? "") ? 1 : -1))
        .map((doc) => {
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
        })
      : [];

    // Recent page views with vehicle info (last 20)
    const recentViews = viewsSnap
      ? viewsSnap.docs
        .sort((a, b) => ((b.data().createdAt ?? "") > (a.data().createdAt ?? "") ? 1 : -1))
        .slice(0, 20)
        .map((doc) => {
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
        })
      : [];

    return NextResponse.json({
      seller: {
        sellerId,
        username: session.username,
        name: session.name,
      },
      stats: {
        totalViews: viewsSnap?.size ?? 0,
        totalAppointments: appointmentsSnap?.size ?? 0,
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
