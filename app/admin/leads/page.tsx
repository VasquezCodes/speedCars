'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
    createdAt: string;
    vehicleName?: string;
    vehiclesViewed?: string[];
    sellerName?: string;
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellerFilter, setSellerFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const router = useRouter();

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (sellerFilter) params.set("sellerCode", sellerFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);

        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        if (res.status === 401) { router.push("/admin"); return; }
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [router, sellerFilter, dateFrom, dateTo]);

    useEffect(() => {
        let isMounted = true;

        async function loadLeads() {
            try {
                await fetchLeads();
            } catch (err) {
                // Ignore any unmounting update state error
                console.error(err);
            }
        }

        // Ensure not causing an unmounted status
        loadLeads().finally(() => {
            if (!isMounted) return;
        });

        return () => {
            isMounted = false;
        };
    }, [fetchLeads]);

    return (
        <div style={{ padding: "32px" }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>Leads y Contactos</h1>
                <p style={{ color: "var(--gray-500)" }}>Todos los clientes que dejaron sus datos</p>
            </div>

            {/* Filters */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                    <label className="form-label">Código vendedor</label>
                    <input value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)} className="form-input" placeholder="ej: ana" />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                    <label className="form-label">Desde</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                    <label className="form-label">Hasta</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-input" />
                </div>
                <button onClick={fetchLeads} className="btn btn-primary" style={{ height: 44 }}>Filtrar</button>
                <button onClick={() => { setSellerFilter(""); setDateFrom(""); setDateTo(""); }} className="btn btn-outline" style={{ height: 44 }}>Limpiar</button>
            </div>

            <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 16 }}>
                {loading ? "Cargando..." : `${leads.length} lead${leads.length !== 1 ? "s" : ""} encontrado${leads.length !== 1 ? "s" : ""}`}
            </p>

            <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                        <thead>
                            <tr style={{ background: "var(--gray-50)" }}>
                                {["Fecha", "Cliente", "Teléfono", "Email", "Vehículo", "Vehículos Vistos", "Vendedor"].map((h) => (
                                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--gray-400)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid var(--gray-100)" }}>
                                        <td colSpan={7} style={{ padding: "14px 16px" }}>
                                            <div className="skeleton" style={{ height: 18, borderRadius: 4 }} />
                                        </td>
                                    </tr>
                                ))
                            ) : leads.length ? (
                                leads.map((lead) => (
                                    <tr key={lead.id} style={{ borderTop: "1px solid var(--gray-100)" }}>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-500)", whiteSpace: "nowrap" }}>
                                            {new Date(lead.createdAt).toLocaleDateString("es-AR")}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--primary)", whiteSpace: "nowrap" }}>{lead.name}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>
                                            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 500 }}>
                                                {lead.phone}
                                            </a>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-600)" }}>{lead.email || "—"}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-700)" }}>{lead.vehicleName || "Consulta general"}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--gray-500)", maxWidth: 200 }}>
                                            {lead.vehiclesViewed?.length
                                                ? <span title={lead.vehiclesViewed.join(", ")}>{lead.vehiclesViewed.length} vehículo{lead.vehiclesViewed.length > 1 ? "s" : ""}</span>
                                                : "—"
                                            }
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            {lead.sellerName
                                                ? <span className="badge badge-success" style={{ whiteSpace: "nowrap" }}>{lead.sellerName}</span>
                                                : <span className="badge badge-gray">Directo</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-400)" }}>No hay leads con esos filtros</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
