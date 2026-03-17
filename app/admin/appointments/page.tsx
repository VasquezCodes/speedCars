"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AdminAppointment, AppointmentStatus } from "@/types/appointment";

// ─── helpers ────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isPast(dateStr: string, timeStr: string): boolean {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt < new Date();
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  completado: "Completado",
};

const STATUS_STYLE: Record<AppointmentStatus, { bg: string; color: string }> = {
  pendiente: { bg: "#fef3c7", color: "#92400e" },
  confirmado: { bg: "#dcfce7", color: "#15803d" },
  cancelado: { bg: "#fee2e2", color: "#b91c1c" },
  completado: { bg: "#ede9fe", color: "#6d28d9" },
};

const ALL_STATUSES: AppointmentStatus[] = ["pendiente", "confirmado", "cancelado", "completado"];

const WEEKDAY_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const SUNDAY_SLOTS  = ["10:00","11:00","12:00","13:00","14:00","15:00"];

function getSlotsForDate(dateStr: string): string[] {
  const dow = new Date(dateStr + "T12:00:00").getDay();
  return dow === 0 ? SUNDAY_SLOTS : WEEKDAY_SLOTS;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function friendlyDay(dateStr: string): string {
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  if (dateStr === today) return "Hoy";
  if (dateStr === tomorrow) return "Mañana";
  if (dateStr === yesterday) return "Ayer";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// ─── StatusBadge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── StatusDropdown ─────────────────────────────────────────────────────────

function StatusDropdown({
  apptId,
  current,
  onChange,
  updating,
}: {
  apptId: string;
  current: AppointmentStatus;
  onChange: (id: string, status: AppointmentStatus) => void;
  updating: boolean;
}) {
  return (
    <select
      value={current}
      disabled={updating}
      onChange={(e) => onChange(apptId, e.target.value as AppointmentStatus)}
      style={{
        padding: "4px 8px", borderRadius: 8, border: "1px solid #e4e4e7",
        fontSize: 12, fontWeight: 600, cursor: updating ? "wait" : "pointer",
        background: STATUS_STYLE[current].bg, color: STATUS_STYLE[current].color,
        fontFamily: "inherit", outline: "none", opacity: updating ? 0.6 : 1,
      }}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"historial" | "agenda">("historial");
  const [updating, setUpdating] = useState<string | null>(null);

  // Historial filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "">("");
  const [filterDate, setFilterDate] = useState("");

  // Agenda
  const [agendaDate, setAgendaDate] = useState(todayStr());

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/appointments")
      .then((r) => {
        if (r.status === 401) { router.push("/admin"); return null; }
        return r.json() as Promise<{ appointments: AdminAppointment[] }>;
      })
      .then((d) => { if (d && alive) setAppointments(d.appointments); })
      .catch(console.error)
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [router]);

  // ── status update ──────────────────────────────────────────────────────────
  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  }

  // ── summary cards ──────────────────────────────────────────────────────────
  const today = todayStr();
  const weekEnd = addDays(today, 7);
  const totalCount = appointments.length;
  const todayCount = appointments.filter((a) => a.date === today).length;
  const weekCount = appointments.filter((a) => a.date >= today && a.date <= weekEnd).length;

  // ── historial filtered ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterDate && a.date !== filterDate) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          (a.vehicleName ?? "").toLowerCase().includes(q) ||
          (a.sellerName ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [appointments, filterStatus, filterDate, search]);

  // ── agenda slots for selected date ────────────────────────────────────────
  const agendaSlots = useMemo(() => {
    const slots = getSlotsForDate(agendaDate);
    const apptsByTime: Record<string, AdminAppointment[]> = {};
    appointments
      .filter((a) => a.date === agendaDate && a.status !== "cancelado")
      .forEach((a) => {
        if (!apptsByTime[a.time]) apptsByTime[a.time] = [];
        apptsByTime[a.time].push(a);
      });
    return slots.map((time) => ({ time, appts: apptsByTime[time] ?? [] }));
  }, [appointments, agendaDate]);

  const TABS = [
    { key: "historial", label: "Historial" },
    { key: "agenda", label: "Agenda" },
  ] as const;

  return (
    <div className="admin-page-pad">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Turnos
        </h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Historial completo y agenda diaria de visitas al local
        </p>
      </div>

      {/* Summary cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 40 }}>
        {[
          {
            label: "Total",
            value: loading ? null : totalCount,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
          },
          {
            label: "Hoy",
            value: loading ? null : todayCount,
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
          {
            label: "Próximos 7 días",
            value: loading ? null : weekCount,
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
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #eaeaea" }}>
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

      {/* ── TAB: HISTORIAL ── */}
      {activeTab === "historial" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar cliente, vehículo, vendedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 10,
                border: "1px solid #e4e4e7", fontSize: 14, fontFamily: "inherit", outline: "none",
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | "")}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid #e4e4e7",
                fontSize: 14, fontFamily: "inherit", outline: "none", background: "white", cursor: "pointer",
              }}
            >
              <option value="">Todos los estados</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid #e4e4e7",
                fontSize: 14, fontFamily: "inherit", outline: "none", background: "white",
              }}
            />
            {(search || filterStatus || filterDate) && (
              <button
                onClick={() => { setSearch(""); setFilterStatus(""); setFilterDate(""); }}
                style={{
                  padding: "10px 16px", borderRadius: 10, border: "1px solid #e4e4e7",
                  background: "white", fontSize: 13, fontWeight: 600, color: "#666",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea" }}>
            <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Cliente", "Vehículo", "Fecha / Hora", "Vendedor", "Notas", "Estado"].map((h) => (
                      <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #eaeaea", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #eaeaea" }}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} style={{ padding: "16px 24px" }}>
                            <div className="skeleton" style={{ width: j === 0 ? 120 : j === 5 ? 80 : 90, height: 14 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 14 }}>
                        {appointments.length === 0 ? "Aún no hay turnos registrados." : "No hay turnos que coincidan con los filtros."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((appt, i) => {
                      const past = isPast(appt.date, appt.time);
                      return (
                        <tr
                          key={appt.id}
                          style={{
                            borderBottom: i < filtered.length - 1 ? "1px solid #eaeaea" : "none",
                            opacity: appt.status === "cancelado" ? 0.55 : 1,
                          }}
                        >
                          {/* Cliente */}
                          <td style={{ padding: "16px 24px" }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 2 }}>{appt.name}</p>
                            <p style={{ fontSize: 12, color: "#aaa" }}>{appt.phone}</p>
                            <p style={{ fontSize: 12, color: "#aaa" }}>{appt.email}</p>
                          </td>
                          {/* Vehículo */}
                          <td style={{ padding: "16px 24px", fontSize: 13, color: appt.vehicleName ? "#111" : "#bbb" }}>
                            {appt.vehicleName ?? "—"}
                          </td>
                          {/* Fecha / Hora */}
                          <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: past && appt.status === "pendiente" ? "#f59e0b" : "#111" }}>
                              {formatDate(appt.date)}
                            </p>
                            <p style={{ fontSize: 13, color: "#888" }}>{appt.time} hs</p>
                          </td>
                          {/* Vendedor */}
                          <td style={{ padding: "16px 24px" }}>
                            {appt.sellerName ? (
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#0a0a0a", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                                {appt.sellerName}
                              </span>
                            ) : (
                              <span style={{ fontSize: 13, color: "#aaa" }}>Directo</span>
                            )}
                          </td>
                          {/* Notas */}
                          <td style={{ padding: "16px 24px", fontSize: 13, color: "#666", maxWidth: 180 }}>
                            <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {appt.notes || "—"}
                            </span>
                          </td>
                          {/* Estado */}
                          <td style={{ padding: "16px 24px" }}>
                            <StatusDropdown
                              apptId={appt.id}
                              current={appt.status}
                              onChange={handleStatusChange}
                              updating={updating === appt.id}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 24px", borderTop: "1px solid #eaeaea", fontSize: 13, color: "#888" }}>
                {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
                {(search || filterStatus || filterDate) && ` de ${appointments.length} totales`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: AGENDA ── */}
      {activeTab === "agenda" && (
        <div>
          {/* Day navigator */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <button
              onClick={() => setAgendaDate((d) => addDays(d, -1))}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e4e4e7", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#444" }}
            >
              ‹
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                {friendlyDay(agendaDate)}
              </p>
              <p style={{ fontSize: 13, color: "#888" }}>
                {(() => {
                  const dow = new Date(agendaDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long" });
                  return dow.charAt(0).toUpperCase() + dow.slice(1);
                })()}
                {agendaDate === todayStr() ? "" : ` · ${formatDate(agendaDate)}`}
              </p>
            </div>
            <button
              onClick={() => setAgendaDate((d) => addDays(d, 1))}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e4e4e7", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#444" }}
            >
              ›
            </button>
            {agendaDate !== todayStr() && (
              <button
                onClick={() => setAgendaDate(todayStr())}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e4e4e7", background: "white", fontSize: 13, fontWeight: 600, color: "#666", cursor: "pointer", fontFamily: "inherit" }}
              >
                Hoy
              </button>
            )}
            <input
              type="date"
              value={agendaDate}
              onChange={(e) => setAgendaDate(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d4d4d8", fontSize: 13, fontFamily: "inherit", outline: "none", background: "white", color: "#111", colorScheme: "light" }}
            />
          </div>

          {/* Slots */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #eaeaea", overflow: "hidden" }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "16px 24px", borderBottom: "1px solid #eaeaea" }}>
                  <div className="skeleton" style={{ width: 52, height: 20, flexShrink: 0 }} />
                  <div className="skeleton" style={{ width: 200, height: 20 }} />
                </div>
              ))
            ) : agendaSlots.map(({ time, appts }, i) => {
              const slotPast = isPast(agendaDate, time);
              const isFull = appts.length >= 3;
              return (
                <div
                  key={time}
                  style={{
                    display: "flex", gap: 20, padding: "16px 24px",
                    borderBottom: i < agendaSlots.length - 1 ? "1px solid #f0f0f0" : "none",
                    background: slotPast ? "#fafafa" : isFull ? "#fff8f0" : "white",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Time */}
                  <div style={{ width: 56, flexShrink: 0, paddingTop: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: slotPast ? "#bbb" : "#111" }}>
                      {time}
                    </span>
                    <span style={{ fontSize: 11, color: "#aaa", display: "block" }}>hs</span>
                  </div>

                  {/* Occupancy bar */}
                  <div style={{ width: 4, flexShrink: 0, alignSelf: "stretch", minHeight: 40, borderRadius: 4, background: appts.length === 0 ? "#f0f0f0" : appts.length < 3 ? "#dcfce7" : "#fde68a" }} />

                  {/* Appointments or empty */}
                  <div style={{ flex: 1 }}>
                    {appts.length === 0 ? (
                      <span style={{ fontSize: 13, color: slotPast ? "#ccc" : "#aaa" }}>
                        {slotPast ? "Sin reservas" : "Disponible"}
                      </span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {appts.map((appt) => (
                          <div
                            key={appt.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 12,
                              padding: "10px 16px", borderRadius: 10,
                              background: STATUS_STYLE[appt.status].bg + "55",
                              border: `1px solid ${STATUS_STYLE[appt.status].bg}`,
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{appt.name}</p>
                              {appt.vehicleName && (
                                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{appt.vehicleName}</p>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "#888", margin: 0, whiteSpace: "nowrap" }}>{appt.phone}</p>
                            {appt.sellerName && (
                              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "#0a0a0a", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                                {appt.sellerName}
                              </span>
                            )}
                            <StatusDropdown
                              apptId={appt.id}
                              current={appt.status}
                              onChange={handleStatusChange}
                              updating={updating === appt.id}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Slot count */}
                  <div style={{ flexShrink: 0, fontSize: 12, color: appts.length === 0 ? "#ddd" : "#888", paddingTop: 4 }}>
                    {appts.length}/3
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
            {[
              { color: "#f0f0f0", label: "Sin reservas" },
              { color: "#dcfce7", label: "Con espacio" },
              { color: "#fde68a", label: "Completo" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: "1px solid #e4e4e7" }} />
                <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
