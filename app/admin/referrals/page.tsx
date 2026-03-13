"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ReferralsApiResponse,
  PageViewRecord,
  AppointmentRecord,
  ReferralStats,
  AnyTimestamp,
  SerializedTimestamp,
} from "@/types/referral";

function formatTimestamp(ts: AnyTimestamp | null | undefined): string {
  if (!ts) return "—";
  try {
    // Firestore client Timestamp object
    if (typeof (ts as { toDate?: unknown }).toDate === "function") {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).format((ts as { toDate: () => Date }).toDate());
    }
    // Admin SDK Timestamp serialized to JSON → { _seconds, _nanoseconds }
    const seconds = (ts as SerializedTimestamp)._seconds;
    if (typeof seconds === "number") {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).format(new Date(seconds * 1000));
    }
    return "—";
  } catch {
    return "—";
  }
}

function ConversionBadge({ views, appts }: { views: number; appts: number }) {
  if (views === 0 && appts === 0) return <span style={{ color: "#aaa", fontSize: 13 }}>—</span>;
  const pct = views > 0 ? Math.round((appts / views) * 100) : 100;
  const color = pct >= 20 ? "#16a34a" : pct >= 10 ? "#ca8a04" : "#dc2626";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      background: color + "18", color, fontSize: 12, fontWeight: 700,
    }}>
      {pct}%
    </span>
  );
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "activity" | "appointments">("stats");
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/referrals")
      .then((r) => {
        if (r.status === 401) { router.push("/admin"); return null; }
        return r.json() as Promise<ReferralsApiResponse>;
      })
      .then((d) => { if (d && isMounted) setData(d); })
      .catch((err) => console.error("Referrals fetch error:", err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  // Map referrerId → sellerName for display in view/appointment tabs
  const sellerNameMap = new Map<string, string>();
  data?.stats.forEach((r) => {
    if (r.sellerId && r.sellerName) sellerNameMap.set(r.sellerId, r.sellerName);
  });

  const totalViews = data?.stats.reduce((s, r) => s + r.totalViews, 0) ?? 0;
  const totalReferrers = data?.stats.filter((r) => r.referrerId !== "(orgánico)").length ?? 0;
  const totalAppointments = data?.stats.reduce((s, r) => s + r.totalAppointments, 0) ?? 0;
  const referredAppointments = data?.recentAppointments.filter((a) => a.referrerId).length ?? 0;

  const TABS = [
    { key: "stats", label: "Por Asesor" },
    { key: "activity", label: "Vistas Recientes" },
    { key: "appointments", label: "Turnos con Referido" },
  ] as const;

  return (
    <div className="admin-page-pad">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Referidos
        </h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Funnel completo por asesor — vistas de vehículos y turnos generados desde el parámetro{" "}
          <code style={{ background: "#f4f4f5", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>?ref=</code>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 40 }}>
        {[
          {
            label: "Vistas Totales",
            value: loading ? null : totalViews,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
          },
          {
            label: "Asesores Activos",
            value: loading ? null : totalReferrers,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
          },
          {
            label: "Turnos Totales",
            value: loading ? null : totalAppointments,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
          },
          {
            label: "Turnos Referidos",
            value: loading ? null : referredAppointments,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: "white", borderRadius: 12, padding: 24,
            border: "1px solid #eaeaea", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f9f9f9", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: 36, fontWeight: 700, color: "#111", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 6 }}>
                {card.value === null
                  ? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 36 }} />
                  : card.value}
              </p>
              <p style={{ fontSize: 13, color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-ref-tabs" style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #eaeaea" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px", fontSize: 14, fontWeight: 600,
              color: activeTab === tab.key ? "#111" : "#888",
              background: "none", border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #111" : "2px solid transparent",
              cursor: "pointer", marginBottom: -1, fontFamily: "inherit", transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Stats per referrer — with conversion funnel */}
      {activeTab === "stats" && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea" }}>
          <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Asesor / Referido", "Vistas", "Vehículos Únicos", "Turnos", "Conversión", "Última Actividad"].map((h) => (
                    <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
                          <div className="skeleton" style={{ width: 100, height: 14 }} />
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 40, height: 22, borderRadius: 12 }} /></td>
                      <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 24, height: 14 }} /></td>
                      <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 40, height: 22, borderRadius: 12 }} /></td>
                      <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 48, height: 22, borderRadius: 12 }} /></td>
                      <td style={{ padding: "16px 24px" }}><div className="skeleton" style={{ width: 96, height: 14 }} /></td>
                    </tr>
                  ))
                ) : data?.stats.length ? (
                  data.stats.map((row: ReferralStats, i: number) => {
                    const isOrganic = row.referrerId === "(orgánico)";
                    const displayName = row.sellerName ?? row.referrerId;
                    const initials = isOrganic ? "—" : displayName.slice(0, 2).toUpperCase();
                    return (
                      <tr key={row.sellerId ?? row.referrerId} style={{ borderBottom: i < data.stats.length - 1 ? "1px solid #eaeaea" : "none" }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: isOrganic ? "#f0f0f0" : "#0a0a0a",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700,
                              color: isOrganic ? "#888" : "#fff", flexShrink: 0,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: 14, color: "#111", display: "block" }}>
                                {displayName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            minWidth: 32, height: 24, borderRadius: 12,
                            background: "#f4f4f5", fontSize: 13, fontWeight: 700, color: "#111", padding: "0 10px",
                          }}>
                            {row.totalViews}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: 14, color: "#666" }}>{row.uniqueVehicles}</td>
                        <td style={{ padding: "16px 24px" }}>
                          {row.totalAppointments > 0 ? (
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              minWidth: 32, height: 24, borderRadius: 12,
                              background: "#dcfce7", fontSize: 13, fontWeight: 700, color: "#16a34a", padding: "0 10px",
                            }}>
                              {row.totalAppointments}
                            </span>
                          ) : (
                            <span style={{ color: "#aaa", fontSize: 13 }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <ConversionBadge views={row.totalViews} appts={row.totalAppointments} />
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: 13, color: "#888" }}>
                          {formatTimestamp(row.lastActivity)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>Aún no hay datos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Recent page views */}
      {activeTab === "activity" && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea" }}>
          <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Vehículo", "Asesor", "Fecha y Hora"].map((h) => (
                    <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                      <td style={{ padding: "14px 24px" }}>
                        <div className="skeleton" style={{ width: 140, height: 14, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: 80, height: 12 }} />
                      </td>
                      <td style={{ padding: "14px 24px" }}><div className="skeleton" style={{ width: 72, height: 22, borderRadius: 20 }} /></td>
                      <td style={{ padding: "14px 24px" }}><div className="skeleton" style={{ width: 96, height: 14 }} /></td>
                    </tr>
                  ))
                ) : data?.recentViews.length ? (
                  data.recentViews.map((view: PageViewRecord, i: number) => (
                    <tr key={view.id} style={{ borderBottom: i < data.recentViews.length - 1 ? "1px solid #eaeaea" : "none" }}>
                      <td style={{ padding: "14px 24px" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 2 }}>{view.vehicleName}</p>
                        <p style={{ fontSize: 12, color: "#aaa" }}>ID: {view.vehicleId}</p>
                      </td>
                      <td style={{ padding: "14px 24px" }}>
                        {view.referrerId ? (
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#0a0a0a", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                            {sellerNameMap.get(view.referrerId) ?? view.referrerId}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: "#aaa" }}>Orgánico</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 24px", fontSize: 13, color: "#888" }}>{formatTimestamp(view.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>Aún no hay actividad registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Appointments with referrer */}
      {activeTab === "appointments" && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea" }}>
          <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Cliente", "Vehículo", "Fecha / Hora", "Contacto", "Asesor", "Reservado"].map((h) => (
                    <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                      <td style={{ padding: "14px 24px" }}>
                        <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: 80, height: 12 }} />
                      </td>
                      <td style={{ padding: "14px 24px" }}><div className="skeleton" style={{ width: 100, height: 14 }} /></td>
                      <td style={{ padding: "14px 24px" }}>
                        <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: 56, height: 12 }} />
                      </td>
                      <td style={{ padding: "14px 24px" }}>
                        <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: 120, height: 12 }} />
                      </td>
                      <td style={{ padding: "14px 24px" }}><div className="skeleton" style={{ width: 72, height: 22, borderRadius: 20 }} /></td>
                      <td style={{ padding: "14px 24px" }}><div className="skeleton" style={{ width: 96, height: 14 }} /></td>
                    </tr>
                  ))
                ) : data?.recentAppointments.filter((a) => a.referrerId).length ? (
                  data.recentAppointments
                    .filter((a: AppointmentRecord) => a.referrerId)
                    .map((appt: AppointmentRecord, i: number, arr: AppointmentRecord[]) => (
                      <tr key={appt.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid #eaeaea" : "none" }}>
                        <td style={{ padding: "14px 24px" }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 2 }}>{appt.name}</p>
                          {appt.notes && <p style={{ fontSize: 12, color: "#aaa" }}>{appt.notes}</p>}
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          {appt.vehicleName ? (
                            <p style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>{appt.vehicleName}</p>
                          ) : (
                            <span style={{ fontSize: 13, color: "#aaa" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{appt.date}</p>
                          <p style={{ fontSize: 13, color: "#888" }}>{appt.time} hs</p>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <p style={{ fontSize: 13, color: "#111" }}>{appt.phone}</p>
                          <p style={{ fontSize: 12, color: "#aaa" }}>{appt.email}</p>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#0a0a0a", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                            {sellerNameMap.get(appt.referrerId!) ?? appt.referrerId}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#888" }}>
                          {formatTimestamp(appt.createdAt)}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>
                      Aún no hay turnos con referido registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
