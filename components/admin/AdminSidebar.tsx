'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/leads", label: "Leads / Contactos", icon: "👥" },
    { href: "/admin/vehicles", label: "Vehículos", icon: "🚗" },
    { href: "/admin/sellers", label: "Vendedores", icon: "🤝" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.push("/admin");
        router.refresh();
    }

    return (
        <div className="admin-sidebar" style={{ display: "flex", flexDirection: "column" }}>
            {/* Logo */}
            <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚗</div>
                    <div>
                        <p style={{ color: "white", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>AutosDealer</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>Panel Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                                borderRadius: "var(--radius-md)", fontWeight: 500, fontSize: 14,
                                color: isActive ? "white" : "rgba(255,255,255,0.6)",
                                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                                transition: "all 0.15s",
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
                        borderRadius: "var(--radius-md)", background: "none", border: "none",
                        color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer",
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                >
                    🚪 Cerrar sesión
                </button>
            </div>
        </div>
    );
}
