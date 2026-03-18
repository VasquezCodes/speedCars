'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number | string;
    fuelType?: string;
    images?: string[];
}

interface RecentAppointment {
    id: string;
    date: string;
    time: string;
    name: string;
    vehicleName?: string;
    sellerName?: string;
    status: string;
}

interface DashboardStats {
    totalVehicles: number;
    recentVehicles: Vehicle[];
    todayAppointmentsCount: number;
    pendingAppointmentsCount: number;
    recentAppointments: RecentAppointment[];
    totalActiveSellers: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

function friendlyDate(dateStr: string): string {
    const today = todayStr();
    const tomorrow = addDays(today, 1);
    if (dateStr === today) return "Hoy";
    if (dateStr === tomorrow) return "Mañana";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
    pendiente:  { bg: "#fef3c7", color: "#92400e", label: "Pendiente" },
    confirmado: { bg: "#dcfce7", color: "#15803d", label: "Confirmado" },
    cancelado:  { bg: "#fee2e2", color: "#b91c1c", label: "Cancelado" },
    completado: { bg: "#ede9fe", color: "#6d28d9", label: "Completado" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
    label, value, icon, loading, accent, href,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    loading: boolean;
    accent?: string;
    href?: string;
}) {
    const inner = (
        <div style={{
            background: "white",
            borderRadius: 14,
            padding: "22px 24px",
            border: "1px solid #eaeaea",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            transition: "box-shadow 0.2s, transform 0.15s",
            cursor: href ? "pointer" : "default",
            textDecoration: "none",
            color: "inherit",
        }}
            onMouseEnter={e => {
                if (href) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "none";
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: accent ? `${accent}18` : "#f4f4f4",
                color: accent ?? "#555",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <p style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#0a0a0a",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    marginBottom: 5,
                    fontVariantNumeric: "tabular-nums",
                }}>
                    {loading
                        ? <span className="skeleton" style={{ display: "inline-block", width: 56, height: 30, borderRadius: 6 }} />
                        : value}
                </p>
                <p style={{ fontSize: 12, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                </p>
            </div>
        </div>
    );

    return href
        ? <Link href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
        : inner;
}

function SectionHeader({ title, href, linkLabel = "Ver todos" }: { title: string; href: string; linkLabel?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>{title}</h2>
            <Link href={href} style={{
                fontSize: 12, fontWeight: 600, color: "#666",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
                padding: "4px 10px", borderRadius: 8, border: "1px solid #e4e4e7",
                transition: "background 0.15s",
            }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f9f9f9")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
                {linkLabel} <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
            </Link>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let alive = true;
        fetch("/api/admin/stats")
            .then((r) => {
                if (r.status === 401) { router.push("/admin"); return null; }
                return r.json();
            })
            .then((data) => { if (data && alive) setStats(data as DashboardStats); })
            .catch(console.error)
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [router]);

    const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
    const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

    return (
        <div className="admin-page-pad">

            {/* ── Header ── */}
            <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em", marginBottom: 4 }}>
                        Dashboard
                    </h1>
                    <p style={{ color: "#999", fontSize: 14 }}>{todayCap}</p>
                </div>
                {/* Quick action */}
                <Link href="/admin/vehicles" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 10,
                    background: "#0a0a0a", color: "white",
                    fontSize: 13, fontWeight: 600, textDecoration: "none",
                    transition: "opacity 0.15s",
                }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Nuevo vehículo
                </Link>
            </div>

            {/* ── Stats grid ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 14,
                marginBottom: 36,
            }}>
                <StatCard
                    label="Vehículos activos"
                    value={stats?.totalVehicles ?? 0}
                    loading={loading}
                    href="/admin/vehicles"
                    accent="#2563eb"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
                />
                <StatCard
                    label="Turnos hoy"
                    value={stats?.todayAppointmentsCount ?? 0}
                    loading={loading}
                    href="/admin/appointments"
                    accent="#16a34a"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <StatCard
                    label="Turnos pendientes"
                    value={stats?.pendingAppointmentsCount ?? 0}
                    loading={loading}
                    href="/admin/appointments"
                    accent="#f59e0b"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                />
                <StatCard
                    label="Vendedores activos"
                    value={stats?.totalActiveSellers ?? 0}
                    loading={loading}
                    href="/admin/sellers"
                    accent="#7c3aed"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                />
            </div>

            {/* ── Quick access ── */}
            <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    Accesos rápidos
                </h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                        { href: "/admin/vehicles", label: "Vehículos", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                        { href: "/admin/appointments", label: "Turnos", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                        { href: "/admin/sellers", label: "Vendedores", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                        { href: "/admin/referrals", label: "Referidos", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
                    ].map(({ href, label, icon }) => (
                        <Link key={href} href={href} style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            padding: "8px 16px", borderRadius: 10,
                            border: "1px solid #e4e4e7",
                            background: "white",
                            fontSize: 13, fontWeight: 600, color: "#444",
                            textDecoration: "none",
                            transition: "background 0.15s, border-color 0.15s",
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "#f9f9f9";
                                e.currentTarget.style.borderColor = "#d0d0d0";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.borderColor = "#e4e4e7";
                            }}
                        >
                            {icon} {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Two-column activity ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 20,
                marginBottom: 32,
            }}>

                {/* Recent Appointments */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #eaeaea", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                        <SectionHeader title="Últimos turnos" href="/admin/appointments" />
                    </div>
                    <div>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{ padding: "14px 24px", borderBottom: "1px solid #f9f9f9", display: "flex", gap: 12, alignItems: "center" }}>
                                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                        <div className="skeleton" style={{ width: "60%", height: 12, borderRadius: 4 }} />
                                        <div className="skeleton" style={{ width: "40%", height: 10, borderRadius: 4 }} />
                                    </div>
                                    <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }} />
                                </div>
                            ))
                        ) : !stats?.recentAppointments?.length ? (
                            <div style={{ padding: "40px 24px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                                Sin turnos registrados
                            </div>
                        ) : stats.recentAppointments.map((appt, i) => {
                            const sc = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pendiente;
                            return (
                                <div key={appt.id} style={{
                                    padding: "13px 24px",
                                    borderBottom: i < stats.recentAppointments.length - 1 ? "1px solid #f5f5f5" : "none",
                                    display: "flex", alignItems: "center", gap: 12,
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "#f4f4f4",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, fontSize: 14, fontWeight: 700, color: "#888",
                                    }}>
                                        {appt.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {appt.name}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {appt.vehicleName ?? "Sin vehículo"} · {friendlyDate(appt.date)}
                                        </p>
                                    </div>
                                    <span style={{
                                        flexShrink: 0,
                                        padding: "3px 9px", borderRadius: 20,
                                        background: sc.bg, color: sc.color,
                                        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                                    }}>
                                        {sc.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* ── Recent Vehicles ── */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #eaeaea", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                    <SectionHeader title="Vehículos recientes" href="/admin/vehicles" />
                </div>
                <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#fafafa" }}>
                                {["", "Vehículo", "Año", "Precio", "Combustible", "Transmisión"].map((h) => (
                                    <th key={h} style={{
                                        padding: "12px 20px", textAlign: "left",
                                        fontSize: 11, fontWeight: 700, color: "#aaa",
                                        letterSpacing: "0.06em", textTransform: "uppercase",
                                        borderBottom: "1px solid #f0f0f0",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ padding: "10px 20px", width: 64 }}>
                                            <div className="skeleton" style={{ width: 52, height: 40, borderRadius: 8 }} />
                                        </td>
                                        <td style={{ padding: "14px 20px" }}><div className="skeleton" style={{ width: 130, height: 13, borderRadius: 4 }} /></td>
                                        <td style={{ padding: "14px 20px" }}><div className="skeleton" style={{ width: 36, height: 13, borderRadius: 4 }} /></td>
                                        <td style={{ padding: "14px 20px" }}><div className="skeleton" style={{ width: 68, height: 13, borderRadius: 4 }} /></td>
                                        <td style={{ padding: "14px 20px" }}><div className="skeleton" style={{ width: 56, height: 13, borderRadius: 4 }} /></td>
                                        <td style={{ padding: "14px 20px" }}><div className="skeleton" style={{ width: 76, height: 13, borderRadius: 4 }} /></td>
                                    </tr>
                                ))
                            ) : stats?.recentVehicles?.length ? (
                                stats.recentVehicles.map((vehicle, index) => (
                                    <tr key={vehicle.id} style={{
                                        borderBottom: index < stats.recentVehicles.length - 1 ? "1px solid #f5f5f5" : "none",
                                        transition: "background 0.1s",
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "10px 20px", width: 64 }}>
                                            {vehicle.images?.[0] ? (
                                                <div style={{ width: 52, height: 40, borderRadius: 8, overflow: "hidden", background: "#f3f4f6" }}>
                                                    <img src={vehicle.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            ) : (
                                                <div style={{ width: 52, height: 40, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontWeight: 600, color: "#111", fontSize: 13 }}>
                                            {vehicle.brand} {vehicle.model}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#777" }}>{vehicle.year}</td>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#111", fontWeight: 600 }}>
                                            ${Number(vehicle.price).toLocaleString("es-AR")}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#777" }}>{vehicle.fuelType || "—"}</td>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#777" }}>
                                            {(vehicle as Vehicle & { transmission?: string }).transmission || "—"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                                        Aún no hay vehículos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
