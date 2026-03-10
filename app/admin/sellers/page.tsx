'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Seller {
    id: string;
    name: string;
    code: string;
    email: string;
}

export default function AdminSellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", code: "", email: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const fetchSellers = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/sellers");
        if (res.status === 401) { router.push("/admin"); return; }
        const data = await res.json();
        setSellers(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        fetchSellers();
    }, [fetchSellers]);

    function autoCode(name: string) {
        return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    }

    async function handleAdd() {
        setSaving(true);
        setError("");
        const res = await fetch("/api/admin/sellers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Error al agregar");
        } else {
            setShowForm(false);
            setForm({ name: "", code: "", email: "" });
            fetchSellers();
        }
        setSaving(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`¿Eliminar a "${name}"?`)) return;
        await fetch("/api/admin/sellers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        setSellers((s) => s.filter((x) => x.id !== id));
    }

    function copyLink(code: string) {
        navigator.clipboard.writeText(`${siteUrl}/?ref=${code}`);
        alert("¡Link copiado al portapapeles!");
    }

    return (
        <div style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>Vendedores</h1>
                    <p style={{ color: "var(--gray-500)" }}>Gestión de vendedores y sus links de referido</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Agregar Vendedor</button>
            </div>

            {/* Info box */}
            <div style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, fontSize: 14, color: "var(--primary)" }}>
                <strong>💡 ¿Cómo funciona?</strong> Cada vendedor tiene un link único como <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: 4 }}>/? ref=nombre</code>. Cuando un cliente abre ese link, el sistema lo "memoriza" por 30 días. Si ese cliente llena un formulario o hace clic en WhatsApp, el lead quedará asignado al vendedor correspondiente.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ background: "white", borderRadius: "var(--radius-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
                            <div className="skeleton" style={{ height: 24, borderRadius: 4, marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 16, borderRadius: 4, width: "60%" }} />
                        </div>
                    ))
                ) : sellers.length ? (
                    sellers.map((seller) => (
                        <div key={seller.id} style={{ background: "white", borderRadius: "var(--radius-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18 }}>
                                        {seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: "var(--primary)", fontSize: 16 }}>{seller.name}</p>
                                        <p style={{ fontSize: 13, color: "var(--gray-400)" }}>{seller.email || "Sin email"}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(seller.id, seller.name)} style={{ background: "none", border: "none", color: "var(--gray-300)", cursor: "pointer", fontSize: 18 }}>🗑️</button>
                            </div>

                            {/* Referral Link */}
                            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 12 }}>
                                <p style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Link de referido</p>
                                <p style={{ fontSize: 13, fontFamily: "monospace", color: "var(--primary)", wordBreak: "break-all" }}>
                                    {siteUrl}/?ref={seller.code}
                                </p>
                            </div>
                            <button
                                onClick={() => copyLink(seller.code)}
                                className="btn btn-outline btn-sm"
                                style={{ width: "100%" }}
                            >
                                📋 Copiar Link
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: "var(--gray-400)" }}>
                        <p style={{ fontSize: 40, marginBottom: 16 }}>🤝</p>
                        <p>No hay vendedores registrados. Agregá el primero.</p>
                    </div>
                )}
            </div>

            {/* Add Seller Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="modal-box">
                        <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: 20, color: "var(--gray-400)", cursor: "pointer" }}>✕</button>
                        <h2 style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 24, fontSize: 20 }}>Agregar Vendedor</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nombre completo *</label>
                                <input
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, code: autoCode(e.target.value) }))}
                                    placeholder="Ej: Ana García"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Código único *</label>
                                <input
                                    className="form-input"
                                    value={form.code}
                                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                                    placeholder="ana_garcia"
                                />
                                <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                                    Link: {siteUrl}/?ref={form.code || "codigo"}
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email (para notificaciones)</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="vendedor@email.com"
                                />
                            </div>
                            {error && <p style={{ color: "var(--accent)", fontSize: 14 }}>{error}</p>}
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? "Guardando..." : "Agregar Vendedor"}
                                </button>
                                <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
