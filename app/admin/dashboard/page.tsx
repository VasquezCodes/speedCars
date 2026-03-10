'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Lead {
    id: string;
    name: string;
    phone: string;
    vehicleName?: string;
    sellerName?: string;
    createdAt: string;
}

interface Stats {
    totalLeads: number;
    totalVehicles: number;
    totalClicks: number;
    totalSellers: number;
    recentLeads: Lead[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        fetch("/api/admin/stats")
            .then((r) => {
                if (r.status === 401) {
                    router.push("/admin");
                    return null;
                }
                return r.json();
            })
            .then((data) => {
                if (data && isMounted) {
                    setStats(data as Stats);
                }
            })
            .catch(err => {
                console.error("Dashboard fetch error:", err);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [router]);

    return (
        <div style={{ padding: "32px" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: "var(--gray-500)" }}>Resumen general de la plataforma</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
                {[
                    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: "👥", color: "#4f46e5", bgColor: "rgba(79,70,229,0.08)" },
                    { label: "Vehículos Activos", value: stats?.totalVehicles ?? "—", icon: "🚗", color: "var(--accent)", bgColor: "rgba(233,69,96,0.08)" },
                    { label: "Clics en WhatsApp", value: stats?.totalClicks ?? "—", icon: "💬", color: "#25D366", bgColor: "rgba(37,211,102,0.08)" },
                    { label: "Vendedores", value: stats?.totalSellers ?? "—", icon: "🤝", color: "var(--gold)", bgColor: "rgba(245,166,35,0.08)" },
                ].map((card) => (
                    <div key={card.label} style={{
                        background: "white", borderRadius: "var(--radius-lg)", padding: "24px",
                        boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 8
                    }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: card.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                            {card.icon}
                        </div>
                        <p style={{ fontSize: 32, fontWeight: 900, color: card.color, lineHeight: 1 }}>
                            {loading ? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 36, borderRadius: 6 }} /> : card.value}
                        </p>
                        <p style={{ fontSize: 14, color: "var(--gray-500)", fontWeight: 500 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Leads */}
            <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ fontWeight: 700, color: "var(--primary)", fontSize: 18 }}>Leads Recientes</h2>
                    <Link href="/admin/leads" className="btn btn-outline btn-sm">Ver todos</Link>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "var(--gray-50)" }}>
                                {["Fecha", "Cliente", "Teléfono", "Vehículo", "Vendedor"].map((h) => (
                                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--gray-500)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={5} style={{ padding: "12px 20px" }}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td></tr>
                                ))
                            ) : stats?.recentLeads?.length ? (
                                stats.recentLeads.map((lead: Lead) => (
                                    <tr key={lead.id} style={{ borderTop: "1px solid var(--gray-100)" }}>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--gray-500)" }}>
                                            {new Date(lead.createdAt).toLocaleDateString("es-AR")}
                                        </td>
                                        <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--primary)" }}>{lead.name}</td>
                                        <td style={{ padding: "14px 20px", fontSize: 13 }}>
                                            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366" }}>
                                                {lead.phone}
                                            </a>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--gray-600)" }}>{lead.vehicleName || "—"}</td>
                                        <td style={{ padding: "14px 20px" }}>
                                            {lead.sellerName
                                                ? <span className="badge badge-success">{lead.sellerName}</span>
                                                : <span className="badge badge-gray">Directo</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--gray-400)" }}>Aún no hay leads registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
