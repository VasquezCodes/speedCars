import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    // Delete seller + all associated pageViews and appointments
    const [viewsSnap, appointmentsSnap] = await Promise.all([
      adminDb.collection("pageViews").where("referrerId", "==", id).get(),
      adminDb.collection("appointments").where("referrerId", "==", id).get(),
    ]);

    const batch = adminDb.batch();
    batch.delete(adminDb.collection("sellers").doc(id));
    viewsSnap.docs.forEach((d) => batch.delete(d.ref));
    appointmentsSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seller DELETE error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
