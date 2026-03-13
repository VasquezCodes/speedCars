import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — AutosDealer" };

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    // Allow access to the login page without auth
    // The actual check for authenticated routes is done per-page via redirect
    const isAuthenticated = !!session?.value;

    return (
        <div style={{ minHeight: "100vh" }}>
            {isAuthenticated ? (
                <div style={{ display: "flex", minHeight: "100vh" }}>
                    <AdminSidebar />
                    <main className="admin-main" style={{ flex: 1, minWidth: 0, background: "#f8f9fa", minHeight: "100vh" }}>
                        {children}
                    </main>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
