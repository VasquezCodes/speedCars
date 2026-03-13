'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Car, Users, UserCog, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/vehicles", label: "Vehículos", icon: Car },
    { href: "/admin/sellers", label: "Vendedores", icon: UserCog },
    { href: "/admin/referrals", label: "Referidos", icon: Users },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    async function handleLogout() {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.push("/admin");
        router.refresh();
    }

    const NavLinks = ({ onClose }: { onClose?: () => void }) => (
        <nav style={{ flex: 1, padding: "32px 16px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                            borderRadius: 16, fontWeight: 700, fontSize: 14,
                            transition: "all 0.2s ease", textDecoration: "none",
                            color: isActive ? "#fff" : "#a1a1aa",
                            background: isActive ? "rgba(39,39,42,0.8)" : "transparent",
                            border: isActive ? "1px solid rgba(63,63,70,1)" : "1px solid transparent",
                            boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#ef4444" : "#71717a", filter: isActive ? "drop-shadow(0 0 8px rgba(239,68,68,0.5))" : "none" }}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                        <span style={{ letterSpacing: "0.02em" }}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );

    const LogoutBtn = () => (
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "auto", background: "rgba(0,0,0,0.2)" }}>
            <button
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", borderRadius: 16, fontWeight: 700, fontSize: 14, color: "#a1a1aa", background: "transparent", border: "1px solid transparent", cursor: "pointer", textAlign: "left" as const, transition: "all 0.2s ease", fontFamily: "inherit" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; e.currentTarget.style.borderColor = "transparent"; }}
            >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a" }}>
                    <LogOut size={20} strokeWidth={2} />
                </span>
                <span style={{ letterSpacing: "0.02em" }}>Cerrar Sesión</span>
            </button>
        </div>
    );

    return (
        <>
            {/*
             * APPROACH: Always render both layouts.
             * CSS wrapper classes show/hide each — no JS window detection needed.
             * This avoids SSR/hydration flash where desktop sidebar briefly shows on mobile.
             */}

            {/* ── Desktop sidebar — visible on ≥768px, hidden below via .admin-sidebar-desktop-wrap ── */}
            <div className="admin-sidebar-desktop-wrap">
                <aside style={{
                    position: "fixed", left: 0, top: 0, bottom: 0, width: 260,
                    background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", flexDirection: "column", zIndex: 100,
                    boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
                }}>
                    <div style={{ padding: "28px 32px", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Image src="/logo-nuevo.png" alt="SpeedCars" width={140} height={40} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} priority />
                    </div>
                    <NavLinks />
                    <LogoutBtn />
                </aside>
            </div>

            {/* ── Mobile topbar + drawer — visible below 768px, hidden above via .admin-sidebar-mobile-wrap ── */}
            <div className="admin-sidebar-mobile-wrap">
                {/* Fixed 56px top bar */}
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, height: 56,
                    background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 20px", zIndex: 101,
                }}>
                    <Image src="/logo-nuevo.png" alt="SpeedCars" width={100} height={28} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                    <button
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Abrir menú"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", padding: 4 }}
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Slide-in drawer */}
                {drawerOpen && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
                        <div onClick={() => setDrawerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} />
                        <div style={{ position: "relative", width: 260, background: "#0a0a0a", display: "flex", flexDirection: "column", height: "100%", boxShadow: "4px 0 32px rgba(0,0,0,0.5)", animation: "drawerSlideIn 0.25s ease" }}>
                            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <Image src="/logo-nuevo.png" alt="SpeedCars" width={100} height={28} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                                <button onClick={() => setDrawerOpen(false)} aria-label="Cerrar" style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <NavLinks onClose={() => setDrawerOpen(false)} />
                            <LogoutBtn />
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes drawerSlideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        </>
    );
}
