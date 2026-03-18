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

// Hard delete: removes the seller document only (historical data is preserved)
export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await adminDb.collection("sellers").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seller DELETE error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Soft delete: set isActive = false (preserves all historical data)
export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = (await request.json()) as { isActive: boolean };

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "Campo isActive requerido" }, { status: 400 });
    }

    await adminDb.collection("sellers").doc(id).update({ isActive: body.isActive });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seller PATCH error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
