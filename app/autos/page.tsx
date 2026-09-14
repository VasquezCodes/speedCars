import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogContent from "@/components/CatalogContent";

export const metadata = {
    title: "Used Cars for Sale — Fort Worth, TX",
    description: "Browse FF Speed Cars inventory of quality used vehicles in Fort Worth, TX. Filter by brand, type, and price. Transparent pricing, clean titles.",
    alternates: { canonical: "https://ffspeedcars.com/autos" },
    openGraph: {
        title: "Used Cars for Sale — FF Speed Cars Fort Worth, TX",
        description: "Browse quality used vehicles in Fort Worth, TX. Filter by brand, type, and price.",
        url: "https://ffspeedcars.com/autos",
        siteName: "FF Speed Cars",
        type: "website",
    },
};

export default function CatalogPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: "80vh", background: "var(--primary)" }}>
                <Suspense fallback={<CatalogSkeleton />}>
                    <CatalogContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

function CatalogSkeleton() {
    // Mirrors CatalogContent's real layout so nothing shifts when it swaps in:
    // same 319px sidebar, same breakpoint, same auto-fill grid.
    return (
        <>
            <style>{`
                .cat-skel-wrap { display: flex; min-height: calc(100vh - 112px); }
                .cat-skel-side {
                    width: 319px; flex-shrink: 0;
                    background: var(--clr-surface-a10);
                    border-right: 1px solid var(--clr-surface-a20);
                }
                @media (max-width: 1099px) { .cat-skel-side { display: none; } }
                .cat-skel-main { flex: 1; min-width: 0; max-width: 1560px; padding: 24px 24px 64px; }
                @media (max-width: 560px) { .cat-skel-main { padding: 18px 16px 56px; } }
                .cat-skel-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(258px, 100%), 1fr));
                    gap: 20px;
                }
            `}</style>
            <div className="cat-skel-wrap">
                <aside className="cat-skel-side">
                    <div style={{ height: 53, borderBottom: "1px solid var(--clr-surface-a20)" }} />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: 49, borderBottom: "1px solid var(--clr-surface-a20)" }} />
                    ))}
                </aside>
                <div className="cat-skel-main">
                    <div style={{ height: 36, width: 148, borderRadius: 8, background: "var(--clr-surface-a10)", border: "1px solid var(--clr-surface-a20)", marginBottom: 16 }} />
                    <div className="cat-skel-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "var(--clr-surface-a10)", border: "1px solid var(--clr-surface-a20)" }}>
                                <div style={{ aspectRatio: "3 / 2", background: "var(--clr-surface-a20)" }} />
                                <div style={{ padding: "13px 14px 12px" }}>
                                    <div style={{ height: 36, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 9 }} />
                                    <div style={{ height: 19, borderRadius: 4, background: "var(--clr-surface-a20)", width: "58%" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
