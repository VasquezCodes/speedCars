'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import VehicleCard, { Vehicle } from "@/components/VehicleCard";
import { useSearchParams } from "next/navigation";

/* ─── Constants ─────────────────────────────────────────── */

const VEHICLE_TYPES = [
    { label: "SUVs",          value: "SUV",          asset: "/assetsSpeedCars/asset 0.svg" },
    { label: "Pickups",       value: "Pickup",        asset: "/assetsSpeedCars/asset 1.svg" },
    { label: "Sedanes",       value: "Sedán",         asset: "/assetsSpeedCars/asset 2.svg" },
    { label: "Hatchbacks",    value: "Hatchback",     asset: "/assetsSpeedCars/asset 3.svg" },
    { label: "Coupés",        value: "Coupé",         asset: "/assetsSpeedCars/asset 4.svg" },
    { label: "Minivans",      value: "Minivan",       asset: "/assetsSpeedCars/asset 5.svg" },
    { label: "Deportivos",    value: "Deportivo",     asset: "/assetsSpeedCars/asset 6.svg" },
    { label: "Convertibles",  value: "Convertible",   asset: "/assetsSpeedCars/asset 7.svg" },
    { label: "Eléctricos",    value: "Eléctrico",     asset: "/assetsSpeedCars/asset 8.svg" },
    { label: "4x4",           value: "4x4",           asset: "/assetsSpeedCars/asset 9.svg" },
    { label: "Utilitarios",   value: "Utilitario",    asset: "/assetsSpeedCars/asset 10.svg" },
];

const BRANDS = [
    "Toyota","Ford","Chevrolet","Honda","Volkswagen",
    "Renault","Fiat","Nissan","Hyundai","Peugeot","Citroën",
];

const FUEL_TYPES = ["Nafta", "Diesel", "Híbrido", "Eléctrico", "GNC"];

const PRICE_RANGES = [
    { label: "Hasta $10.000",  value: "10000" },
    { label: "Hasta $20.000",  value: "20000" },
    { label: "Hasta $30.000",  value: "30000" },
    { label: "Hasta $50.000",  value: "50000" },
    { label: "Hasta $80.000",  value: "80000" },
];

const MILEAGE_RANGES = [
    { label: "Hasta 20.000 km",  value: "20000" },
    { label: "Hasta 50.000 km",  value: "50000" },
    { label: "Hasta 100.000 km", value: "100000" },
    { label: "Hasta 150.000 km", value: "150000" },
];

/* ─── Sub-components ─────────────────────────────────────── */

// Filter section row — exactly 70px collapsed (24px padding-top + ~22px text + 24px padding-bottom)
function FilterSection({
    title,
    open,
    onToggle,
    children,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div style={{ borderBottom: "1px solid #ebebeb" }}>
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    // 70px total: 24px top + ~22px content + 24px bottom
                    padding: "24px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 400, color: "#111",
                    fontFamily: "inherit", textAlign: "left",
                    minHeight: 70,
                }}
            >
                {title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#888" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && <div style={{ padding: "0 20px 18px" }}>{children}</div>}
        </div>
    );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 0", cursor: "pointer", fontSize: 13.5, color: "#333",
        }}>
            <div style={{
                width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${checked ? "#d11119" : "#ccc"}`,
                background: checked ? "#d11119" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
            }}>
                {checked && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            {label}
        </label>
    );
}

/* ─── Main Component ─────────────────────────────────────── */

interface CatalogContentProps {
    searchParams: Promise<{ brand?: string; type?: string; maxPrice?: string; search?: string }>;
}

export default function CatalogContent({ searchParams }: CatalogContentProps) {
    const urlParams = useSearchParams();

    const [vehicles, setVehicles]       = useState<Vehicle[]>([]);
    const [loading, setLoading]         = useState(true);
    const [type, setType]               = useState(urlParams.get("type") || "");
    const [brand, setBrand]             = useState(urlParams.get("brand") || "");
    const [maxPrice, setMaxPrice]       = useState(urlParams.get("maxPrice") || "");
    const [maxMileage, setMaxMileage]   = useState("");
    const [fuelTypes, setFuelTypes]     = useState<string[]>([]);
    const [search, setSearch]           = useState(urlParams.get("search") || "");
    const [searchInput, setSearchInput] = useState(urlParams.get("search") || "");
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync with URL param changes (e.g. when navbar search navigates to /autos?search=...)
    const urlSearch = urlParams.get("search") || "";
    useEffect(() => {
        setSearch(urlSearch);
        setSearchInput(urlSearch);
    }, [urlSearch]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => setSearch(value), 400);
    };

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        bodyType: false, brand: false, price: false, mileage: false, fuel: false,
    });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const stripRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft]   = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (brand)              params.set("brand", brand);
            if (type)               params.set("type", type);
            if (maxPrice)           params.set("maxPrice", maxPrice);
            if (maxMileage)         params.set("maxMileage", maxMileage);
            if (fuelTypes.length)   params.set("fuelType", fuelTypes.join(","));
            if (search)             params.set("search", search);
            const res  = await fetch(`/api/vehicles?${params.toString()}`);
            const data = await res.json();
            setVehicles(Array.isArray(data) ? data : []);
        } catch { setVehicles([]); }
        finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand, type, maxPrice, maxMileage, search, fuelTypes.join(",")]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const toggleSection = (id: string) =>
        setOpenSections((s) => ({ ...s, [id]: !s[id] }));

    const toggleFuel = (f: string) =>
        setFuelTypes((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

    const clearAll = () => {
        setType(""); setBrand(""); setMaxPrice(""); setMaxMileage("");
        setFuelTypes([]); setSearch(""); setSearchInput("");
    };

    const hasFilters = type || brand || maxPrice || maxMileage || fuelTypes.length > 0 || search;
    const filterCount = [type, brand, maxPrice, maxMileage, ...fuelTypes].filter(Boolean).length;

    const updateScrollState = () => {
        const el = stripRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };
    useEffect(() => {
        const el = stripRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });
        return () => el.removeEventListener("scroll", updateScrollState);
    }, []);

    const scrollStrip = (dir: "left" | "right") =>
        stripRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });

    /* ── Sidebar content (shared desktop + mobile drawer) ── */
    const sidebarFilters = (
        <>
            {/* Sort by */}
            <div style={{
                padding: "24px 20px", minHeight: 70,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid #ebebeb", cursor: "pointer",
            }}>
                <span style={{ fontSize: 14, color: "#111" }}>Ordenar por</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#666" }}>Más recientes</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Body Type */}
            <FilterSection title="Tipo de carrocería" open={openSections.bodyType} onToggle={() => toggleSection("bodyType")}>
                {VEHICLE_TYPES.map((vt) => (
                    <CheckItem key={vt.value} label={vt.label} checked={type === vt.value}
                        onChange={() => setType(type === vt.value ? "" : vt.value)} />
                ))}
            </FilterSection>

            {/* Price */}
            <FilterSection title="Precio" open={openSections.price} onToggle={() => toggleSection("price")}>
                {PRICE_RANGES.map((r) => (
                    <CheckItem key={r.value} label={r.label} checked={maxPrice === r.value}
                        onChange={() => setMaxPrice(maxPrice === r.value ? "" : r.value)} />
                ))}
            </FilterSection>

            {/* Brand */}
            <FilterSection title="Marca y Modelo" open={openSections.brand} onToggle={() => toggleSection("brand")}>
                {BRANDS.map((b) => (
                    <CheckItem key={b} label={b} checked={brand === b}
                        onChange={() => setBrand(brand === b ? "" : b)} />
                ))}
            </FilterSection>

            {/* Mileage */}
            <FilterSection title="Kilometraje" open={openSections.mileage} onToggle={() => toggleSection("mileage")}>
                {MILEAGE_RANGES.map((r) => (
                    <CheckItem key={r.value} label={r.label} checked={maxMileage === r.value}
                        onChange={() => setMaxMileage(maxMileage === r.value ? "" : r.value)} />
                ))}
            </FilterSection>

            {/* Fuel Type */}
            <FilterSection title="Combustible" open={openSections.fuel} onToggle={() => toggleSection("fuel")}>
                {FUEL_TYPES.map((f) => (
                    <CheckItem key={f} label={f} checked={fuelTypes.includes(f)}
                        onChange={() => toggleFuel(f)} />
                ))}
            </FilterSection>

            {/* Extra stubs matching CarMax's list */}
            {["Características", "Color exterior", "Color interior"].map((label) => (
                <div key={label} style={{
                    padding: "24px 20px", minHeight: 70,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderBottom: "1px solid #ebebeb",
                    fontSize: 14, color: "#111", opacity: 0.6, cursor: "not-allowed",
                }}>
                    {label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            ))}
        </>
    );

    return (
        <>
            <style>{`
                .cat-strip::-webkit-scrollbar { display: none; }
                /* Type card — sized to fill ~296px strip height */
                .cat-type-btn {
                    flex: 0 0 auto;
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    padding: 16px 20px 14px;
                    background: white;
                    border: 1.5px solid #dde1f0;
                    border-radius: 12px;
                    cursor: pointer;
                    min-width: 130px;
                    height: 120px;
                    box-sizing: border-box;
                    transition: border-color 0.16s, background 0.16s, transform 0.16s;
                }
                .cat-type-btn:hover { border-color: #d11119; transform: translateY(-2px); }
                .cat-type-btn.active { border-color: #d11119; background: #fff5f5; }
                .cat-type-btn.active .cat-type-lbl { color: #d11119; font-weight: 700; }
                .cat-type-lbl { font-size: 13px; font-weight: 400; color: "#555"; white-space: nowrap; }
                /* Scroll arrows */
                .cat-sarrow {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    width: 34px; height: 34px; border-radius: 50%;
                    border: 1.5px solid #f0c0c2; background: white; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 5; transition: opacity 0.2s, background 0.2s;
                }
                .cat-sarrow:hover { background: rgba(255,255,255,0.28); }
                .cat-sarrow.hidden { opacity: 0; pointer-events: none; }
                /* Grid */
                .cat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                @media (max-width: 1200px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 900px)  { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 500px)  { .cat-grid { grid-template-columns: 1fr; } }
                /* Sidebar */
                .cat-sidebar {
                    width: 319px;
                    flex-shrink: 0;
                    background: white;
                    border-right: 1px solid #ebebeb;
                    align-self: flex-start;
                    position: sticky;
                    top: 0;
                    max-height: 100vh;
                    overflow-y: auto;
                }
                .cat-sidebar::-webkit-scrollbar { width: 3px; }
                .cat-sidebar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
                @media (max-width: 900px) { .cat-sidebar { display: none; } }
                .cat-mob-btn { display: none; }
                @media (max-width: 900px) { .cat-mob-btn { display: flex; } }
            `}</style>

            {/* ═══ LAYOUT ═══ */}
            <div style={{ display: "flex", minHeight: "calc(100vh - 112px)" }}>

                {/* ── SIDEBAR 319px ── */}
                <nav className="cat-sidebar">

                    {/* Sidebar header — 183px tall */}
                    <div style={{
                        minHeight: 183,
                        padding: "24px 20px 20px",
                        borderBottom: "1px solid #ebebeb",
                        display: "flex", flexDirection: "column",
                        justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round">
                                <line x1="4" y1="6" x2="20" y2="6"/>
                                <line x1="4" y1="12" x2="16" y2="12"/>
                                <line x1="4" y1="18" x2="12" y2="18"/>
                            </svg>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Filtros y Ordenar</span>
                            {hasFilters && (
                                <button onClick={clearAll} style={{
                                    marginLeft: "auto", fontSize: 12, color: "#d11119",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontFamily: "inherit", fontWeight: 600,
                                }}>
                                    Limpiar todo
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: 13, color: "#6d747a", lineHeight: 1.5, margin: "0 0 16px" }}>
                            Agregá filtros para guardar tu búsqueda y recibir notificaciones cuando lleguen nuevos vehículos.
                        </p>

                        <button style={{
                            width: "100%", height: 36, borderRadius: 8,
                            border: "1.5px solid #d11119", background: "white",
                            color: "#d11119", fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                        }}>
                            Guardar búsqueda
                        </button>
                    </div>

                    {/* Filter sections — each row 70px collapsed */}
                    {sidebarFilters}
                </nav>

                {/* ── MAIN CONTENT ── */}
                <div style={{ flex: 1, minWidth: 0, padding: "24px 24px 64px" }}>

                    {/* TYPE STRIP — 296px tall */}
                    <div style={{
                        background: "linear-gradient(180deg, #fdf0f0 0%, #fae8e8 100%)",
                        borderRadius: 14, marginBottom: 20,
                        padding: "20px 28px 20px",
                        boxSizing: "border-box",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            {/* Small car icon like CarMax */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0606a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h8l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
                                <circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>
                            </svg>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#b04a52", margin: 0 }}>
                                ¿Qué tipo de auto buscás?
                            </p>
                        </div>

                        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "stretch" }}>
                            <button
                                className={`cat-sarrow${canScrollLeft ? "" : " hidden"}`}
                                style={{ left: -14 }}
                                onClick={() => scrollStrip("left")}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>

                            <div ref={stripRef} className="cat-strip" style={{
                                display: "flex", gap: 10, overflowX: "auto",
                                scrollbarWidth: "none", flex: 1, alignItems: "flex-start",
                            }}>
                                {VEHICLE_TYPES.map((vt) => (
                                    <button
                                        key={vt.value}
                                        className={`cat-type-btn${type === vt.value ? " active" : ""}`}
                                        onClick={() => setType(type === vt.value ? "" : vt.value)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={vt.asset} alt={vt.label}
                                            style={{ width: 110, height: 60, objectFit: "contain" }}
                                        />
                                        <span className="cat-type-lbl">{vt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                className={`cat-sarrow${canScrollRight ? "" : " hidden"}`}
                                style={{ right: -14 }}
                                onClick={() => scrollStrip("right")}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                    </div>

                    {/* COUNT ROW */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: 16,
                    }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "white", border: "1px solid #e8e8e8",
                            borderRadius: 8, padding: "7px 14px",
                        }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: "#111", lineHeight: 1 }}>
                                {loading ? "—" : vehicles.length.toLocaleString()}
                            </span>
                            <span style={{ fontSize: 13, color: "#777", fontWeight: 400 }}>
                                {loading ? "cargando..." : vehicles.length !== 1 ? "coincidencias" : "coincidencia"}
                            </span>
                        </div>

                        {/* Mobile filter button */}
                        <button
                            className="cat-mob-btn"
                            onClick={() => setMobileFiltersOpen(true)}
                            style={{
                                alignItems: "center", gap: 6,
                                height: 36, padding: "0 14px", borderRadius: 8,
                                border: "1.5px solid #e0e0e0", background: "white",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                                fontFamily: "inherit", color: "#111",
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }}>
                                <line x1="4" y1="6" x2="20" y2="6"/>
                                <line x1="4" y1="12" x2="16" y2="12"/>
                                <line x1="4" y1="18" x2="12" y2="18"/>
                            </svg>
                            Filtros{filterCount > 0 ? ` (${filterCount})` : ""}
                        </button>
                    </div>

                    {/* GRID */}
                    {loading ? (
                        <div className="cat-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "white", border: "1px solid #eee" }}>
                                    <div style={{ paddingTop: "66%", position: "relative" }}>
                                        <div className="skeleton" style={{ position: "absolute", inset: 0 }} />
                                    </div>
                                    <div style={{ padding: "12px 14px 16px" }}>
                                        <div style={{ height: 13, borderRadius: 4, background: "#f0f0f0", marginBottom: 8 }} className="skeleton" />
                                        <div style={{ height: 18, borderRadius: 4, background: "#f0f0f0", marginBottom: 10, width: "70%" }} className="skeleton" />
                                        <div style={{ height: 13, borderRadius: 4, background: "#f0f0f0", width: "45%" }} className="skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : vehicles.length > 0 ? (
                        <div className="cat-grid">
                            {vehicles.map((v) => (
                                <VehicleCard key={v.id} vehicle={v} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "80px 0" }}>
                            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ fontWeight: 700, color: "#111", fontSize: 22, marginBottom: 8 }}>
                                No encontramos vehículos
                            </h3>
                            <p style={{ color: "#888", marginBottom: 28 }}>Probá cambiando los filtros.</p>
                            <button onClick={clearAll} style={{
                                background: "#d11119", color: "white", border: "none",
                                borderRadius: 100, padding: "13px 32px",
                                fontSize: 14, fontWeight: 700, cursor: "pointer",
                            }}>
                                Ver todos los vehículos
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mobile filter drawer ── */}
            {mobileFiltersOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
                        onClick={() => setMobileFiltersOpen(false)} />
                    <div style={{
                        position: "relative", zIndex: 1,
                        background: "white", width: 319, height: "100%",
                        overflowY: "auto", flexShrink: 0,
                        boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
                    }}>
                        {/* Drawer header */}
                        <div style={{
                            padding: "18px 20px", borderBottom: "1px solid #ebebeb",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            position: "sticky", top: 0, background: "white", zIndex: 2,
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>Filtros y Ordenar</span>
                            <button onClick={() => setMobileFiltersOpen(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#555", lineHeight: 1 }}>
                                ✕
                            </button>
                        </div>
                        {sidebarFilters}
                        <div style={{ padding: 20 }}>
                            <button onClick={() => setMobileFiltersOpen(false)} style={{
                                width: "100%", background: "#d11119", color: "white",
                                border: "none", borderRadius: 10, padding: 14,
                                fontSize: 15, fontWeight: 700, cursor: "pointer",
                            }}>
                                Ver {vehicles.length} resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
