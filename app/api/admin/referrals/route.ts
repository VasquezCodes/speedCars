import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import type {
  PageViewRecord,
  ReferralStats,
  AppointmentRecord,
  ReferralsApiResponse,
} from "@/types/referral";
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
  const isAuth = await isAuthenticated(request);
  if (!isAuth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Fetch pageViews, appointments, and sellers in parallel
    const [viewsSnap, appointmentsSnap, sellersSnap] = await Promise.all([
      adminDb.collection("pageViews").orderBy("timestamp", "desc").limit(500).get(),
      adminDb.collection("appointments").orderBy("createdAt", "desc").limit(500).get(),
      adminDb.collection("sellers").get(),
    ]);

    // Build map: sellerId -> { id, name }
    const sellerById = new Map<string, { id: string; name: string }>();
    let activeSellersCount = 0;
    for (const doc of sellersSnap.docs) {
      sellerById.set(doc.id, { id: doc.id, name: doc.data().name as string });
      if (doc.data().isActive === true) activeSellersCount++;
    }

    const recentViews: PageViewRecord[] = viewsSnap.docs.map((doc) => ({
      id: doc.id,
      vehicleId: doc.data().vehicleId as string,
      vehicleSlug: doc.data().vehicleSlug as string,
      vehicleName: doc.data().vehicleName as string,
      referrerId: (doc.data().referrerId as string | null) ?? null,
      userAgent: (doc.data().userAgent as string) ?? "",
      timestamp: doc.data().timestamp as Timestamp,
    }));

    const recentAppointments: AppointmentRecord[] = appointmentsSnap.docs.map((doc) => ({
      id: doc.id,
      date: doc.data().date as string,
      time: doc.data().time as string,
      name: doc.data().name as string,
      phone: doc.data().phone as string,
      email: doc.data().email as string,
      notes: (doc.data().notes as string) ?? "",
      referrerId: (doc.data().referrerId as string) || null,
      vehicleName: (doc.data().vehicleName as string) || undefined,
      createdAt: doc.data().createdAt as Timestamp,
    }));

    // Aggregate — group by sellerId when code resolves to a seller, else by code
    type StatsEntry = {
      referrerId: string;       // key (sellerId or code or "(orgánico)")
      sellerName?: string;
      sellerId?: string;
      totalViews: number;
      vehicleIds: Set<string>;
      totalAppointments: number;
      lastActivity: Timestamp;
    };

    const statsMap = new Map<string, StatsEntry>();

    function getKey(referrerId: string | null): { key: string; sellerName?: string; sellerId?: string } {
      if (!referrerId) return { key: "(orgánico)" };
      const seller = sellerById.get(referrerId);
      if (seller) return { key: seller.id, sellerName: seller.name, sellerId: seller.id };
      return { key: referrerId }; // orphaned/historical
    }

    for (const view of recentViews) {
      const { key, sellerName, sellerId } = getKey(view.referrerId);
      const existing = statsMap.get(key);
      if (!existing) {
        statsMap.set(key, {
          referrerId: view.referrerId ?? "(orgánico)",
          sellerName,
          sellerId,
          totalViews: 1,
          vehicleIds: new Set([view.vehicleId]),
          totalAppointments: 0,
          lastActivity: view.timestamp as Timestamp,
        });
      } else {
        existing.totalViews += 1;
        existing.vehicleIds.add(view.vehicleId);
      }
    }

    for (const appt of recentAppointments) {
      const { key, sellerName, sellerId } = getKey(appt.referrerId);
      const existing = statsMap.get(key);
      if (existing) {
        existing.totalAppointments += 1;
      } else {
        statsMap.set(key, {
          referrerId: appt.referrerId ?? "(orgánico)",
          sellerName,
          sellerId,
          totalViews: 0,
          vehicleIds: new Set(),
          totalAppointments: 1,
          lastActivity: appt.createdAt as Timestamp,
        });
      }
    }

    const stats: ReferralStats[] = Array.from(statsMap.values())
      .map(({ vehicleIds, ...rest }) => ({
        referrerId: rest.referrerId,
        sellerName: rest.sellerName,
        sellerId: rest.sellerId,
        totalViews: rest.totalViews,
        uniqueVehicles: vehicleIds.size,
        totalAppointments: rest.totalAppointments,
        lastActivity: rest.lastActivity,
      }))
      .sort((a, b) => b.totalAppointments - a.totalAppointments || b.totalViews - a.totalViews);

    const response: ReferralsApiResponse = {
      stats,
      recentViews: recentViews.slice(0, 100),
      recentAppointments: recentAppointments.slice(0, 100),
      totalActiveSellers: activeSellersCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Referrals API error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
