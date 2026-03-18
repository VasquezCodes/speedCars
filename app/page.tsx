export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Vehicle } from "@/components/VehicleCard";
import HeroSection from "@/components/HeroSection";
import BrandDivider from "@/components/BrandDivider";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import TrendingHeader from "@/components/TrendingHeader";
import NosotrosSection from "@/components/NosotrosSection";

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  try {
    const snap = await adminDb
      .collection("vehicles")
      .where("isAvailable", "==", true)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const all = snap.docs
      .map((d) => ({ ...d.data(), id: d.id } as Vehicle))
      .filter((v) => v.status !== "Retirado" && v.status !== "Vendido");
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
            <TrendingHeader />

            {featuredVehicles.length > 0 ? (
              <FeaturedCarousel vehicles={featuredVehicles} />
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🏁</p>
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>...</p>
              </div>
            )}
          </div>
        </section>

        {/* About Us */}
        <NosotrosSection />

        {/* Testimonials */}
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
