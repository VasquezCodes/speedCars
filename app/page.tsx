import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCard, { Vehicle } from "@/components/VehicleCard";
import HeroSection from "@/components/HeroSection";
import WavySeparator from "@/components/WavySeparator";
import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldCheck, Handshake, HeadphonesIcon, Settings } from "lucide-react";

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  try {
    const snap = await adminDb
      .collection("vehicles")
      .where("isAvailable", "==", true)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
    const featured = all.filter((v) => v.isFeatured);
    return (featured.length > 0 ? featured : all).slice(0, 6);
  } catch (error) {
    console.error("Error fetching featured vehicles:", error);
    return [];
  }
}

const TYPES = ["Sedán", "SUV", "Pickup", "Hatchback", "Coupé", "Minivan"];

export default async function HomePage() {
  const featuredVehicles = await getFeaturedVehicles();

  return (
    <div style={{ background: "var(--primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <main>
        {/* Hero */}
        <HeroSection />

        <div style={{ marginTop: "60px", marginBottom: "120px", width: "100%", overflow: "hidden" }}>
          <WavySeparator />
        </div>

        {/* Featured Vehicles */}
        <section style={{ padding: "0 0 100px", background: "var(--primary)", position: "relative" }}>

          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", alignItems: "end", marginBottom: "80px" }}>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-rb-rational), sans-serif",
                  fontSize: "clamp(60px, 9vw, 120px)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 0.85,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  margin: "0 0 16px 0",
                  marginLeft: "-4px"
                }}>
                  Trending<br />Cars<span style={{ color: "var(--accent)" }}>.</span>
                </h2>
              </div>

              <div style={{ paddingBottom: "12px", maxWidth: "400px" }}>
                <p style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  color: "var(--text-muted)",
                  fontSize: "17px",
                  lineHeight: 1.6,
                  marginBottom: "32px",
                  fontWeight: 400
                }}>
                  Nuestra colección de los vehículos con mayor demanda. Unidades de primera calidad, verificadas exhaustivamente y listas para llevar hoy.
                </p>

                <Link href="/autos" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  textDecoration: "none",
                  borderBottom: "2px solid var(--text-primary)",
                  paddingBottom: "6px",
                  transition: "color 0.3s ease, border-color 0.3s ease"
                }}
                  className="minimal-link-hover"
                >
                  Explorar todo el stock <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {featuredVehicles.length > 0 ? (
              <div className="vehicle-grid">
                {featuredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🏁</p>
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>Preparando la parrilla de salida...</p>
              </div>
            )}
          </div>
        </section>

        {/* Browse by Type */}
        <section style={{ background: "var(--primary)", padding: "100px 0", borderTop: "1px solid var(--gray-200)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16, color: "var(--text-primary)" }}>Explorar Segmentos</h2>
              <div style={{ width: 60, height: 4, background: "var(--accent)", margin: "0 auto" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
              {TYPES.map((type) => (
                <Link key={type} href={`/autos?type=${encodeURIComponent(type)}`}
                  className="type-card-link"
                  style={{
                    background: "var(--white)",
                    padding: "32px 20px",
                    borderRadius: "0",
                    border: "1px solid var(--gray-200)",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    textDecoration: "none"
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>
                    {type === "SUV" ? "🚙" : type === "Pickup" ? "🛻" : type === "Sedán" ? "🚗" : type === "Hatchback" ? "🚘" : type === "Coupé" ? "🏎️" : "🚐"}
                  </div>
                  <h3 style={{ color: "var(--text-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 14 }}>{type}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section style={{ padding: "120px 0", background: "var(--primary-mid)", borderTop: "1px solid var(--gray-200)" }} id="contacto">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h2 style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 32, color: "var(--text-primary)" }}>
                  Ingeniería en<br />
                  <span style={{ color: "var(--accent)" }}>cada detalle.</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
                  No solo vendemos autos. Entregamos máquinas verificadas, certificadas y listas para el desafío. Transparencia total en el historial y mecánicas garantizadas.
                </p>
                <div style={{ display: "grid", gap: 24 }}>
                  {[
                    { number: "01", icon: <ShieldCheck size={32} strokeWidth={1.5} />, title: "Transparencia Total", desc: "Historial 100% verificado y documentación en regla." },
                    { number: "02", icon: <HeadphonesIcon size={32} strokeWidth={1.5} />, title: "Atención Privada", desc: "Asesoramiento 1 a 1 enfocado absolutamente en el cliente." },
                    { number: "03", icon: <Handshake size={32} strokeWidth={1.5} />, title: "Financiación VIP", desc: "Trazamos el plan perfecto a tu medida sin letras chicas." },
                    { number: "04", icon: <Settings size={32} strokeWidth={1.5} />, title: "Garantía Mecánica", desc: "Testeo en 150 puntos críticos antes de salir a pista." },
                  ].map((feat, idx) => (
                    <div key={idx} className="feat-card" style={{ background: "var(--white)", border: "1px solid var(--gray-200)", padding: 32, display: "flex", gap: 24, alignItems: "flex-start", transition: "transform 0.3s", cursor: "default", position: "relative", overflow: "hidden" }}
                    >
                      <div className="feat-number" style={{ position: "absolute", right: -10, bottom: -20, fontSize: 120, fontWeight: 900, color: "rgba(0,0,0,0.04)", transition: "color 0.3s", lineHeight: 1, zIndex: 0 }}>
                        {feat.number}
                      </div>

                      <div style={{ color: "var(--accent)", position: "relative", zIndex: 1 }}>
                        {feat.icon}
                      </div>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <h3 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 18, marginBottom: 8, letterSpacing: "0.02em" }}>{feat.title}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5 }}>{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner - Full impact red */}
        <section style={{ background: "var(--accent)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
          {/* Abstract background shapes */}
          <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, background: "rgba(0,0,0,0.1)", transform: "rotate(45deg)", zIndex: 0 }}></div>
          <div style={{ position: "absolute", bottom: -100, left: 100, width: 200, height: 600, background: "rgba(255,255,255,0.1)", transform: "rotate(45deg)", zIndex: 0 }}></div>

          <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <h2 style={{ color: "var(--white)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: 24, letterSpacing: "-0.04em", lineHeight: 1 }}>
              EMPEZÁ A METER<br />CAMBIOS HOY.
            </h2>
            <p style={{ color: "var(--primary)", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
              Nuestra flota premium te espera. Acercate o contactanos para una experiencia inolvidable.
            </p>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/autos" className="btn-cta-primary" style={{ background: "var(--primary)", color: "var(--white)", padding: "20px 48px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 15, display: "inline-flex", alignItems: "center", gap: 10, transition: "background 0.3s" }}>
                Ver Inventario <ChevronRight size={18} />
              </Link>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_DEALER_PHONE}`} target="_blank" rel="noopener noreferrer" className="btn-cta-secondary" style={{ background: "transparent", color: "var(--white)", border: "2px solid var(--white)", padding: "18px 48px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 15, display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.3s" }}>
                Contactar Ventas
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 900px) {
          section[id="contacto"] .container > div {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}
