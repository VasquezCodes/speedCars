"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { sileo } from "sileo";
import type { SellerSessionPayload } from "@/types/seller";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SellerStats {
  totalViews: number;
  totalAppointments: number;
  uniqueVehicles: number;
}

interface SellerAppointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  vehicleName: string | null;
  status: string;
  notes: string;
  createdAt: string;
}

interface RecentView {
  id: string;
  vehicleId: string;
  vehicleName: string | null;
  createdAt: string;
}

interface MeResponse {
  seller: SellerSessionPayload;
  stats: SellerStats;
  appointments: SellerAppointment[];
  recentViews: RecentView[];
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function formatTimeAmPm(time: string): string {
  const h = parseInt(time.split(":")[0], 10);
  const suffix = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:  { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24", label: "Pendiente" },
  confirmado: { bg: "rgba(34,197,94,0.15)",   color: "#22c55e", label: "Confirmado" },
  cancelado:  { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "Cancelado" },
  completado: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", label: "Completado" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 24,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
          {value === null
            ? <span className="skeleton-dark" style={{ display: "inline-block", width: 48, height: 32, borderRadius: 6 }} />
            : value}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteUrl, setSiteUrl] = useState("https://tusitio.com");
  const [activeTab, setActiveTab] = useState<"turnos" | "vistas">("turnos");
  const router = useRouter();

  useEffect(() => { setSiteUrl(window.location.origin); }, []);

  useEffect(() => {
    const isMounted = { current: true };
    (async () => {
      try {
        const r = await fetch("/api/seller/me");
        if (r.status === 401) { router.replace("/seller"); return; }
        if (!r.ok) return;
        const d = (await r.json()) as MeResponse;
        if (!d.seller) return;
        if (isMounted.current) setData(d);
      } catch (err) {
        console.error("Seller me error:", err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    })();
    return () => { isMounted.current = false; };
  }, [router]);

  const referralLink = data?.seller ? `${siteUrl}/?ref=${data.seller.sellerId}` : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      sileo.success({ title: "¡Link copiado!", description: "El link de referido está en tu portapapeles." });
    }).catch(() => {
      sileo.error({ title: "No se pudo copiar", description: "Copiá el link manualmente." });
    });
  };

  const handleLogout = async () => {
    await fetch("/api/seller/logout", { method: "POST" });
    router.replace("/seller");
  };

  const TABS = [
    { key: "turnos" as const, label: "Mis turnos", count: data?.appointments?.length },
    { key: "vistas" as const, label: "Vistas recientes", count: data?.recentViews?.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>

      {/* Top bar */}
      <header className="seller-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo-nuevo.png" alt="SpeedCars" width={120} height={34} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {data && (
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              Hola, <strong style={{ color: "#fff" }}>{data.seller.name}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Salir
          </button>
        </div>
      </header>

      <main className="seller-main" style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>Mi Panel</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Tu rendimiento como asesor de ventas</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16, marginBottom: 36 }}>
          <StatCard
            label="Vistas generadas"
            value={loading ? null : (data?.stats.totalViews ?? 0)}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          />
          <StatCard
            label="Autos únicos vistos"
            value={loading ? null : (data?.stats.uniqueVehicles ?? 0)}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
          />
          <StatCard
            label="Turnos reservados"
            value={loading ? null : (data?.stats.totalAppointments ?? 0)}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          {!loading && data && (
            <StatCard
              label="Conversión"
              value={data.stats.totalViews > 0 ? Math.round((data.stats.totalAppointments / data.stats.totalViews) * 100) : 0}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            />
          )}
        </div>

        {/* Referral link */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Tu link de referido</h2>
            <button
              onClick={handleCopy}
              disabled={loading}
              style={{
                padding: "7px 16px", borderRadius: 8,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", opacity: loading ? 0.5 : 1,
              }}
            >
              Copiar link
            </button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 14 }}>
            Compartí este link con tus clientes. Los turnos que vengan por acá quedan bajo tu nombre.
          </p>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px" }}>
            {loading ? (
              <span className="skeleton-dark" style={{ display: "block", height: 18, borderRadius: 4 }} />
            ) : (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", wordBreak: "break-all", fontFamily: "monospace" }}>
                {referralLink}
              </span>
            )}
          </div>
        </div>

        {/* Tabs: Turnos / Vistas */}
        <div style={{ marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 4 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.35)",
                background: "none", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer", marginBottom: -1, display: "flex", alignItems: "center", gap: 8,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
              {!loading && tab.count !== undefined && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 7px", borderRadius: 20,
                  background: activeTab === tab.key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                  color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.3)",
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: TURNOS ── */}
        {activeTab === "turnos" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="skeleton-dark" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton-dark" style={{ width: "50%", height: 12, borderRadius: 4 }} />
                    <div className="skeleton-dark" style={{ width: "30%", height: 10, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton-dark" style={{ width: 70, height: 22, borderRadius: 20 }} />
                </div>
              ))
            ) : !data?.appointments?.length ? (
              <div style={{ padding: "56px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📅</div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Aún no tenés turnos registrados.</p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, marginTop: 4 }}>Compartí tu link de referido para empezar.</p>
              </div>
            ) : (
              data.appointments.map((appt, i) => {
                const sc = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pendiente;
                return (
                  <div key={appt.id} style={{
                    padding: "16px 24px",
                    borderBottom: i < data.appointments.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: "rgba(255,255,255,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)",
                    }}>
                      {appt.name?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{appt.name}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                        {appt.vehicleName ?? "Sin vehículo"}
                        {appt.notes ? ` · ${appt.notes}` : ""}
                      </p>
                    </div>

                    {/* Date/time */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}>
                        {friendlyDate(appt.date)}
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{formatTimeAmPm(appt.time)}</p>
                    </div>

                    {/* Contact */}
                    <div style={{ flexShrink: 0 }}>
                      <a
                        href={`https://wa.me/${appt.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 10px", borderRadius: 8,
                          background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)",
                          color: "#25d366", fontSize: 12, fontWeight: 600, textDecoration: "none",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        {appt.phone}
                      </a>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      flexShrink: 0, padding: "4px 10px", borderRadius: 20,
                      background: sc.bg, color: sc.color,
                      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                    }}>
                      {sc.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: VISTAS ── */}
        {activeTab === "vistas" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="skeleton-dark" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                  <div className="skeleton-dark" style={{ flex: 1, height: 12, borderRadius: 4 }} />
                  <div className="skeleton-dark" style={{ width: 50, height: 10, borderRadius: 4 }} />
                </div>
              ))
            ) : !data?.recentViews?.length ? (
              <div style={{ padding: "56px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>👁</div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Aún no hay vistas registradas.</p>
              </div>
            ) : (
              data.recentViews.map((view, i) => (
                <div key={view.id} style={{
                  padding: "13px 24px",
                  borderBottom: i < data.recentViews.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.3)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <p style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {view.vehicleName ?? "Vehículo sin nombre"}
                  </p>
                  <span style={{ flexShrink: 0, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    {timeAgo(view.createdAt)}
                  </span>
                </div>
              ))
            )}
            {!loading && data && data.stats.totalViews > 20 && (
              <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                Mostrando las últimas 20 de {data.stats.totalViews} vistas totales
              </div>
            )}
          </div>
        )}

        <div style={{ height: 48 }} />
      </main>
    </div>
  );
}
