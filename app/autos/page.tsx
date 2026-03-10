import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogContent from "@/components/CatalogContent";

export const metadata = {
    title: "Catálogo de Autos",
    description: "Explorá todos nuestros vehículos disponibles. Filtrá por marca, tipo y precio.",
};

export default function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ brand?: string; type?: string; maxPrice?: string; search?: string }>;
}) {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: "80vh" }}>
                <div style={{ background: "var(--primary)", padding: "40px 0 60px" }}>
                    <div className="container">
                        <p className="section-eyebrow" style={{ marginBottom: 8, color: "var(--accent)" }}>Inventario disponible</p>
                        <h1 style={{ color: "white", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 8 }}>
                            Catálogo de Vehículos
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}>
                            Encontrá el auto perfecto entre todos nuestros vehículos disponibles.
                        </p>
                    </div>
                </div>
                <div style={{ marginTop: -20 }}>
                    <Suspense fallback={<CatalogSkeleton />}>
                        <CatalogContent searchParams={searchParams} />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </>
    );
}

function CatalogSkeleton() {
    return (
        <div className="container" style={{ padding: "40px 24px" }}>
            <div style={{ height: 60, borderRadius: "var(--radius-lg)", marginBottom: 32 }} className="skeleton" />
            <div className="vehicle-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                        <div style={{ height: 200 }} className="skeleton" />
                        <div style={{ padding: 20, background: "white" }}>
                            <div style={{ height: 16, borderRadius: 4, marginBottom: 8 }} className="skeleton" />
                            <div style={{ height: 24, borderRadius: 4, marginBottom: 16 }} className="skeleton" />
                            <div style={{ height: 16, borderRadius: 4, width: "60%" }} className="skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
