"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import type { SellerRecord } from "@/types/seller";
import type { AnyTimestamp } from "@/types/referral";

function formatDate(ts: AnyTimestamp | null | undefined): string {
  if (!ts) return "—";
  try {
    const seconds =
      typeof (ts as { toDate?: unknown }).toDate === "function"
        ? Math.floor((ts as { toDate: () => Date }).toDate().getTime() / 1000)
        : (ts as { _seconds: number })._seconds;
    if (typeof seconds !== "number") return "—";
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(seconds * 1000)
    );
  } catch {
    return "—";
  }
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", username: "", password: "", email: "" });

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/sellers");
      if (r.status === 401) { router.push("/admin"); return; }
      const data = (await r.json()) as { sellers: SellerRecord[] };
      setSellers(data.sellers ?? []);
    } catch (err) {
      console.error("Sellers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await r.json()) as { error?: string; id?: string };
      if (!r.ok) {
        sileo.error({
          title: "Error al crear",
          description: data.error ?? "No se pudo crear el vendedor.",
        });
      } else {
        sileo.success({
          title: "Vendedor creado",
          description: `${form.name} fue agregado al equipo.`,
        });
        setForm({ name: "", username: "", password: "", email: "" });
        setShowForm(false);
        await fetchSellers();
      }
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "Verificá tu conexión e intentá nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return;
    const newActive = !seller.isActive;
    setTogglingId(id);
    setToggleConfirm(null);

    const doToggle = async () => {
      const r = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (!r.ok) throw new Error("Error al actualizar");
      setSellers((prev) => prev.map((s) => s.id === id ? { ...s, isActive: newActive } : s));
    };

    const promise = doToggle();

    sileo.promise(promise, {
      loading: { title: newActive ? "Reactivando..." : "Desactivando...", description: `${seller.name}` },
      success: {
        title: newActive ? "Vendedor reactivado" : "Vendedor desactivado",
        description: newActive
          ? `${seller.name} puede volver a ingresar al sistema.`
          : `${seller.name} ya no puede ingresar. Sus datos históricos se conservan.`,
      },
      error: { title: "Error", description: "No se pudo actualizar el vendedor." },
    });

    await promise.catch(() => null);
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    const seller = sellers.find((s) => s.id === id);
    setDeletingId(id);
    setDeleteConfirm(null);

    const doDelete = async () => {
      const r = await fetch(`/api/admin/sellers/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Error al eliminar");
      setSellers((prev) => prev.filter((s) => s.id !== id));
    };

    const promise = doDelete();
    sileo.promise(promise, {
      loading: { title: "Eliminando...", description: seller ? `Eliminando a ${seller.name}` : undefined },
      success: { title: "Vendedor eliminado", description: seller ? `${seller.name} fue eliminado permanentemente.` : "El vendedor fue eliminado." },
      error: { title: "Error al eliminar", description: "No se pudo eliminar el vendedor." },
    });

    await promise.catch(() => null);
    setDeletingId(null);
  };

  return (
    <div className="admin-page-pad">
      {/* Header */}
      <div className="admin-sellers-header-inner">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 6 }}>Vendedores</h1>
          <p style={{ color: "#666", fontSize: 15 }}>Administrá el equipo de ventas. Cada vendedor tiene su propio link de referido.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-sellers-new-btn"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "#0a0a0a", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nuevo Vendedor
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ marginBottom: 32, background: "white", borderRadius: 12, border: "1px solid #eaeaea", padding: 28, animation: "slideUp 0.2s ease" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 20 }}>Nuevo Vendedor</h2>
          <form onSubmit={handleCreate}>
            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Nombre completo", key: "name", placeholder: "Juan García", type: "text", required: true },
                { label: "Usuario (para login)", key: "username", placeholder: "juangarcia", type: "text", required: true },
                { label: "Contraseña", key: "password", placeholder: "Mínimo 6 caracteres", type: "password", required: true },
                { label: "Email (notificaciones de turnos)", key: "email", placeholder: "vendedor@ejemplo.com", type: "email", required: false },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    required={field.required}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  background: submitting ? "#e5e7eb" : "#0a0a0a",
                  color: submitting ? "#888" : "#fff",
                  border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {submitting && (
                  <span style={{
                    display: "inline-block", width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(0,0,0,0.15)", borderTopColor: "#555",
                    animation: "sellerSpin 0.6s linear infinite",
                  }} />
                )}
                {submitting ? "Creando..." : "Crear Vendedor"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: "10px 24px", borderRadius: 8, background: "transparent", color: "#666", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sellers Table */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea" }}>
        <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Vendedor", "Usuario", "Email", "Estado", "Creado", ""].map((h) => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                        <div className="skeleton" style={{ width: 120, height: 14 }} />
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="skeleton" style={{ width: 140, height: 14 }} />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }} />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="skeleton" style={{ width: 72, height: 14 }} />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
                    </td>
                  </tr>
                ))
              ) : sellers.length ? (
                sellers.map((seller, i) => (
                  <tr
                    key={seller.id}
                    style={{
                      borderBottom: i < sellers.length - 1 ? "1px solid #eaeaea" : "none",
                      opacity: seller.isActive ? 1 : 0.6,
                      animation: `fadeInRow 0.3s ease ${i * 40}ms both`,
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: seller.isActive ? "#0a0a0a" : "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {seller.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{seller.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 13, color: "#666" }}>
                      <code style={{ background: "#f4f4f5", padding: "2px 8px", borderRadius: 4 }}>{seller.username}</code>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 13, color: "#666" }}>
                      {seller.email ?? <span style={{ color: "#ccc" }}>—</span>}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: seller.isActive ? "#f0fdf4" : "#f4f4f5", color: seller.isActive ? "#16a34a" : "#888", fontSize: 12, fontWeight: 700 }}>
                        {seller.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 13, color: "#888" }}>{formatDate(seller.createdAt)}</td>
                    <td style={{ padding: "16px 24px" }}>
                      {togglingId === seller.id || deletingId === seller.id ? (
                        <span style={{ fontSize: 12, color: "#aaa" }}>...</span>
                      ) : toggleConfirm === seller.id ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#666" }}>¿Confirmar?</span>
                          <button
                            onClick={() => handleToggleActive(seller.id)}
                            style={{ padding: "4px 10px", borderRadius: 6, background: seller.isActive ? "#dc2626" : "#16a34a", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}
                          >
                            Sí
                          </button>
                          <button onClick={() => setToggleConfirm(null)} style={{ padding: "4px 10px", borderRadius: 6, background: "#f4f4f5", color: "#666", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>No</button>
                        </div>
                      ) : deleteConfirm === seller.id ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>¿Eliminar permanentemente?</span>
                          <button
                            onClick={() => handleDelete(seller.id)}
                            style={{ padding: "4px 10px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}
                          >
                            Sí, eliminar
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ padding: "4px 10px", borderRadius: 6, background: "#f4f4f5", color: "#666", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>No</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {/* Toggle active */}
                          <button
                            onClick={() => setToggleConfirm(seller.id)}
                            title={seller.isActive ? "Desactivar vendedor" : "Reactivar vendedor"}
                            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", color: seller.isActive ? "#aaa" : "#16a34a", padding: "4px 10px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s, border-color 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = seller.isActive ? "#f59e0b" : "#15803d"; e.currentTarget.style.borderColor = seller.isActive ? "#f59e0b" : "#15803d"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = seller.isActive ? "#aaa" : "#16a34a"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                          >
                            {seller.isActive ? (
                              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Desactivar</>
                            ) : (
                              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Reactivar</>
                            )}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirm(seller.id)}
                            title="Eliminar vendedor"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 4, display: "flex", transition: "color 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>Aún no hay vendedores. Creá el primero.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes sellerSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
