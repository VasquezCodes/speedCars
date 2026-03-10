import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    const isAuthenticated = session?.value === "authenticated";

    return (
        <div style={{ minHeight: "100vh" }}>
            {isAuthenticated ? (
                <div className="admin-layout">
                    <AdminSidebar />
                    <div className="admin-content" style={{ padding: 0 }}>
                        {children}
                    </div>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
