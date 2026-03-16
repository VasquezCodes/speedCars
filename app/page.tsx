import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Vehicle } from "@/components/VehicleCard";
import HeroSection from "@/components/HeroSection";
import BrandDivider from "@/components/BrandDivider";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeaturedCarousel from "@/components/FeaturedCarousel";

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  try {
    const snap = await adminDb
      .collection("vehicles")
      .where("isAvailable", "==", true)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const all = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Vehicle));
    const featured = all.filter((v) => v.isFeatured);
    return (featured.length > 0 ? featured : all).slice(0, 6);
  } catch (error) {
    console.error("Error fetching featured vehicles:", error);
    return [];
  }
}



export default async function HomePage() {
  const featuredVehicles = await getFeaturedVehicles();

  return (
    <div style={{ background: "var(--primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <main>
        {/* Hero */}
        <HeroSection />

        <div className="brand-divider-wrapper" style={{ marginTop: "64px", marginBottom: "120px", width: "100%", overflow: "hidden" }}>
          <BrandDivider />
        </div>

        {/* Featured Vehicles */}
        <section className="trending-section" style={{ padding: "0 0 100px", position: "relative" }}>

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
              <FeaturedCarousel vehicles={featuredVehicles} />
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🏁</p>
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>Preparando la parrilla de salida...</p>
              </div>
            )}
          </div>
        </section>

        {/* About Us */}
        <section id="nosotros" style={{ padding: "80px 0", background: "var(--white)", borderTop: "1px solid var(--gray-200)" }}>
          <div className="container">
            <div className="nosotros-grid">

              {/* Text */}
              <div>
                <h2 style={{
                  fontFamily: "var(--font-rb-rational), sans-serif",
                  fontSize: "clamp(40px, 5vw, 72px)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  marginBottom: "24px",
                  marginLeft: "-3px"
                }}>
                  Conoce<br />nuestra<br />historia<span style={{ color: "var(--accent)" }}>.</span>
                </h2>
                <div style={{ width: 36, height: 3, background: "var(--accent)", marginBottom: 28 }} />
                <p style={{
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  lineHeight: 1.7,
                  maxWidth: "420px"
                }}>
                  En FF Speed Cars entregamos la libertad de conducir con absoluta tranquilidad. Especialistas en vehículos meticulosamente verificados listos para exigentes conductores.
                </p>
              </div>

              {/* Image */}
              <div className="nosotros-img-wrap" style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                <Image
                  src="/history.png"
                  alt="FF Speed Cars - Fort Worth, TX"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

            </div>

            {/* Mision, Vision, Proposito Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", marginTop: "80px", borderTop: "1px solid var(--gray-200)", paddingTop: "64px" }}>
              {[
                { 
                  title: "Misión", 
                  text: "Brindar a nuestros clientes vehículos de calidad a precios accesibles, ofreciendo un servicio honesto, transparente y personalizado. Nos enfocamos en ayudar a cada persona a encontrar el automóvil que mejor se adapte a sus necesidades, haciendo que el proceso de compra sea fácil, confiable y satisfactorio." 
                },
                { 
                  title: "Visión", 
                  text: "Ser una de las ventas de vehículos más confiables y recomendadas en la comunidad, destacándonos por nuestra integridad, excelente atención al cliente y por ofrecer opciones de vehículos que generen confianza y seguridad en cada compra." 
                },
                { 
                  title: "Propósito", 
                  text: "Nuestro propósito es ayudar a las personas y familias a cumplir el sueño de tener su propio vehículo, creando relaciones de confianza con nuestros clientes y aportando valor a nuestra comunidad a través de un servicio responsable y transparente." 
                }
              ].map((item, index) => (
                <div key={index} style={{ paddingRight: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--accent)" }} />
                    {item.title}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Testimoniales / Clientes Satisfechos */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
