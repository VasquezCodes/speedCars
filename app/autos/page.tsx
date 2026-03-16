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
            <main style={{ minHeight: "80vh", background: "var(--primary)" }}>
                <Suspense fallback={<CatalogSkeleton />}>
                    <CatalogContent searchParams={searchParams} />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

function CatalogSkeleton() {
    return (
        <div style={{ display: "flex", maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
            {/* Sidebar skeleton */}
            <aside style={{ width: 280, flexShrink: 0, padding: "24px 0" }}>
                <div style={{ height: 40, borderRadius: 8, background: "var(--clr-surface-a20)", marginBottom: 16 }} />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ height: 52, borderBottom: "1px solid var(--clr-surface-a20)", background: "var(--clr-surface-a10)" }} />
                ))}
            </aside>
            {/* Content skeleton */}
            <div style={{ flex: 1, minWidth: 0, padding: "24px 0 24px 24px" }}>
                <div style={{ height: 130, borderRadius: 12, background: "var(--clr-surface-a20)", marginBottom: 24 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "var(--clr-surface-a10)" }}>
                            <div style={{ paddingTop: "66%", background: "var(--clr-surface-a20)" }} />
                            <div style={{ padding: 14 }}>
                                <div style={{ height: 14, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 8 }} />
                                <div style={{ height: 18, borderRadius: 4, background: "var(--clr-surface-a20)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
