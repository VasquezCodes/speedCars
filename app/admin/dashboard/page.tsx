'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number | string;
    fuelType?: string;
    transmission?: string;
    createdAt?: string;
    images?: string[];
}

interface Stats {
    totalVehicles: number;
    recentVehicles: Vehicle[];
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
        <div className="admin-page-pad">
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 6 }}>Dashboard</h1>
                <p style={{ color: "#666", fontSize: 15 }}>Resumen general de la plataforma</p>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid" style={{ marginBottom: 48 }}>
                {[
                    { 
                        label: "Vehículos Activos", value: stats?.totalVehicles ?? "—", 
                        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>, 
                        color: "#111", bgColor: "#f9f9f9" 
                    },
                ].map((card) => (
                    <div key={card.label} style={{
                        background: "white", borderRadius: "12px", padding: "24px",
                        border: "1px solid #eaeaea", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: "8px", background: card.bgColor, color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: 36, fontWeight: 700, color: card.color, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 6 }}>
                                {loading ? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 36 }} /> : card.value}
                            </p>
                            <p style={{ fontSize: 13, color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Vehicles */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eaeaea" }}>
                <div style={{ padding: "24px", borderBottom: "1px solid #eaeaea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ fontWeight: 600, color: "#111", fontSize: 16, letterSpacing: "0.02em" }}>Vehículos Recientes</h2>
                    <Link href="/admin/vehicles" style={{ fontSize: 13, fontWeight: 500, color: "#666", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        Ver todos <span style={{ fontSize: 16 }}>&rarr;</span>
                    </Link>
                </div>
                <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#fafafa" }}>
                                {["", "Vehículo", "Año", "Precio", "Combustible", "Transmisión"].map((h) => (
                                    <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                                        <td style={{ padding: "12px 24px", width: 72 }}>
                                            <div className="skeleton" style={{ width: 56, height: 42, borderRadius: 8 }} />
                                        </td>
                                        <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 140, height: 14 }} /></td>
                                        <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 40, height: 14 }} /></td>
                                        <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 72, height: 14 }} /></td>
                                        <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 60, height: 14 }} /></td>
                                        <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                                    </tr>
                                ))
                            ) : stats?.recentVehicles?.length ? (
                                stats.recentVehicles.map((vehicle: Vehicle, index: number) => (
                                    <tr key={vehicle.id} style={{ borderBottom: index < stats.recentVehicles.length - 1 ? "1px solid #eaeaea" : "none" }}>
                                        <td style={{ padding: "12px 24px", width: 72 }}>
                                            {vehicle.images?.[0] ? (
                                                <div style={{ width: 56, height: 42, borderRadius: 8, overflow: "hidden", background: "#f3f4f6" }}>
                                                    <img src={vehicle.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            ) : (
                                                <div style={{ width: 56, height: 42, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontWeight: 500, color: "#111", fontSize: 14 }}>
                                            {vehicle.brand} {vehicle.model}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: 14, color: "#666" }}>
                                            {vehicle.year}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: 14, color: "#111", fontWeight: 500 }}>
                                            ${Number(vehicle.price).toLocaleString("es-AR")}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: 14, color: "#666" }}>
                                            {vehicle.fuelType || "—"}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: 14, color: "#666" }}>
                                            {vehicle.transmission || "—"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: 14 }}>Aún no hay vehículos registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
