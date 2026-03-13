"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { sileo } from "sileo";
import type { SellerSessionPayload } from "@/types/seller";

interface SellerStats {
  totalViews: number;
  totalAppointments: number;
  uniqueVehicles: number;
}

interface MeResponse {
  seller: SellerSessionPayload;
  stats: SellerStats;
}

function StatCard({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
          {value === null
            ? <span className="skeleton-dark" style={{ display: "inline-block", width: 48, height: 32 }} />
            : value}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteUrl, setSiteUrl] = useState("https://tusitio.com");
  const router = useRouter();

  useEffect(() => { setSiteUrl(window.location.origin); }, []);

  useEffect(() => {
    const isMounted = { current: true };
    (async () => {
      try {
        const r = await fetch("/api/seller/me");
        if (r.status === 401) { router.replace("/seller"); return; }
        if (!r.ok) { console.error("Seller me failed:", r.status); return; }
        const d = (await r.json()) as MeResponse;
        if (!d.seller) { console.error("Seller me: missing seller in response"); return; }
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
      sileo.success({
        title: "¡Link copiado!",
        description: "El link de referido está en tu portapapeles.",
      });
    }).catch(() => {
      sileo.error({
        title: "No se pudo copiar",
        description: "Copiá el link manualmente.",
      });
    });
  };

  const handleLogout = async () => {
    await fetch("/api/seller/logout", { method: "POST" });
    router.replace("/seller");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      {/* Top bar */}
      <header className="seller-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo-nuevo.png" alt="SpeedCars" width={120} height={34} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {data && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Hola, <strong style={{ color: "#fff" }}>{data.seller.name}</strong></span>}
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Salir
          </button>
        </div>
      </header>

      <main className="seller-main" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>Mi Panel</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Tu rendimiento como asesor de ventas</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
          <StatCard label="Vistas generadas" value={loading ? null : (data?.stats.totalViews ?? 0)} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>} />
          <StatCard label="Vehículos únicos" value={loading ? null : (data?.stats.uniqueVehicles ?? 0)} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} />
          <StatCard label="Turnos reservados" value={loading ? null : (data?.stats.totalAppointments ?? 0)} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
        </div>

        {/* Referral link card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: 8 }}>Tu link de referido</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Compartí este link con tus clientes. Si alguien lo usa y reserva un turno, el turno queda asociado a vos.
          </p>

          <div className="seller-ref-row" style={{ display: "flex", gap: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 16px" }}>
            {loading ? (
              <span className="skeleton-dark" style={{ flex: 1, height: 20 }} />
            ) : (
              <span style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.8)", wordBreak: "break-all", fontFamily: "monospace" }}>
                {referralLink}
              </span>
            )}
            <button
              onClick={handleCopy}
              disabled={loading}
              style={{
                padding: "8px 16px", borderRadius: 8, flexShrink: 0,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Copiar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
