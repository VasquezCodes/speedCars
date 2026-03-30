'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import VehicleCard, { Vehicle } from "@/components/VehicleCard";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

/* ─── Static values (DB filter keys — language-independent) ─ */

const VEHICLE_TYPE_VALUES  = ["SUV","Pickup","Sedán","Hatchback","Coupé","Minivan","Deportivo","Convertible","Eléctrico","4x4","Utilitario"];
const VEHICLE_TYPE_ASSETS  = Array.from({ length: 11 }, (_, i) => `/assetsSpeedCars/asset ${i}.svg`);
const FUEL_TYPE_VALUES     = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "GLP"];
const PRICE_VALUES         = ["10000", "20000", "30000", "50000", "80000"];
const MAX_MILEAGE = 200000;

const BRANDS = [
    "Toyota","Ford","Chevrolet","Honda","Volkswagen",
    "Jeep","Dodge","Ram","GMC","Cadillac","Lincoln",
    "Buick","Chrysler","Tesla","Hummer",
    "Renault","Fiat","Nissan","Hyundai","Peugeot","Citroën",
    "BMW","Mercedes-Benz","Audi","Kia","Mazda","Subaru",
    "Mitsubishi","Land Rover","Infiniti","Lexus",
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
        <div style={{ borderBottom: "1px solid var(--clr-surface-a20)" }}>
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    padding: "14px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 400, color: "var(--text-primary)",
                    fontFamily: "inherit", textAlign: "left",
                }}
            >
                {title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--clr-surface-a40)" strokeWidth="2.5" strokeLinecap="round"
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
        <label onClick={onChange} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 0", cursor: "pointer", fontSize: 13.5, color: "var(--text-secondary)",
        }}>
            <div style={{
                width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${checked ? "#d11119" : "var(--clr-surface-a30)"}`,
                background: checked ? "#d11119" : "var(--clr-surface-a10)",
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
    const { t } = useLanguage();
    const c = t.catalog;

    const VEHICLE_TYPES = VEHICLE_TYPE_VALUES.map((value, i) => ({
        value, label: c.vehicleTypeLabels[i] as string, asset: VEHICLE_TYPE_ASSETS[i],
    }));
    const FUEL_TYPES    = FUEL_TYPE_VALUES.map((value, i) => ({ value, label: c.fuelTypeLabels[i] as string }));
    const PRICE_RANGES  = PRICE_VALUES.map((value, i)    => ({ value, label: c.priceLabels[i] as string }));

    const MAX_PRICE = 10000;

    const [vehicles, setVehicles]       = useState<Vehicle[]>([]);
    const [loading, setLoading]         = useState(true);
    const [type, setType]               = useState(urlParams.get("type") || "");
    const [brand, setBrand]             = useState(urlParams.get("brand") || "");
    const [priceSlider, setPriceSlider] = useState(() => {
        const v = parseInt(urlParams.get("maxPrice") || "");
        return isNaN(v) ? MAX_PRICE : v;
    });
    const [maxPrice, setMaxPrice]       = useState(urlParams.get("maxPrice") || "");
    const [mileageSlider, setMileageSlider] = useState(MAX_MILEAGE);
    const [maxMileage, setMaxMileage]   = useState("");
    const [fuelTypes, setFuelTypes]     = useState<string[]>([]);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [search, setSearch]           = useState(urlParams.get("search") || "");
    const [searchInput, setSearchInput] = useState(urlParams.get("search") || "");
    const [sortBy, setSortBy]           = useState("recent");
    const hasLoadedOnce                 = useRef(false);
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
        sort: false, bodyType: false, brand: false, price: false, mileage: false, fuel: false,
    });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        finally { setLoading(false); hasLoadedOnce.current = true; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brand, type, maxPrice, maxMileage, search, fuelTypes.join(",")]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const toggleSection = (id: string) =>
        setOpenSections((s) => ({ ...s, [id]: !s[id] }));

    const toggleFuel = (f: string) =>
        setFuelTypes((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

    const handlePriceSlider = (val: number) => {
        setPriceSlider(val);
        setMaxPrice(val >= MAX_PRICE ? "" : String(val));
    };

    const handleMileageSlider = (val: number) => {
        setMileageSlider(val);
        setMaxMileage(val >= MAX_MILEAGE ? "" : String(val));
    };

    const clearAll = () => {
        setType(""); setBrand(""); setMaxPrice(""); setMaxMileage("");
        setFuelTypes([]); setSearch(""); setSearchInput("");
        setPriceSlider(MAX_PRICE); setMileageSlider(MAX_MILEAGE);
        setAvailableOnly(false);
    };

    const hasFilters = type || brand || maxPrice || maxMileage || fuelTypes.length > 0 || search || availableOnly;
    const filterCount = [type, brand, maxPrice, maxMileage, ...fuelTypes, availableOnly ? "1" : ""].filter(Boolean).length;

    const filteredVehicles = availableOnly ? vehicles.filter((v) => v.status !== "Vendido") : vehicles;
    const sortedVehicles = [...filteredVehicles].sort((a, b) => {
        if (sortBy === "price-asc")   return (a.price ?? 0) - (b.price ?? 0);
        if (sortBy === "price-desc")  return (b.price ?? 0) - (a.price ?? 0);
        if (sortBy === "mileage-asc") return (a.mileage ?? 0) - (b.mileage ?? 0);
        if (sortBy === "year-desc")   return (b.year ?? 0) - (a.year ?? 0);
        if (sortBy === "year-asc")    return (a.year ?? 0) - (b.year ?? 0);
        return 0; // "recent" — keep original fetch order
    });

    /* ── Sidebar content (shared desktop + mobile drawer) ── */
    const sidebarFilters = (
        <>
            {/* Sort by */}
            <FilterSection
                title={c.sortBy}
                open={openSections.sort}
                onToggle={() => toggleSection("sort")}
            >
                {(c.sortOptions as unknown as { value: string; label: string }[]).map((opt) => (
                    <label key={opt.value} onClick={() => { setSortBy(opt.value); setTimeout(() => setOpenSections((s) => ({ ...s, sort: false })), 350); }}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "5px 0", cursor: "pointer", fontSize: 13.5,
                            color: sortBy === opt.value ? "var(--text-primary)" : "var(--text-secondary)",
                            fontWeight: sortBy === opt.value ? 600 : 400,
                        }}>
                        <div style={{
                            width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                            border: `1.5px solid ${sortBy === opt.value ? "#d11119" : "var(--clr-surface-a30)"}`,
                            background: sortBy === opt.value ? "#d11119" : "var(--clr-surface-a10)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                        }}>
                            {sortBy === opt.value && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                        </div>
                        {opt.label}
                    </label>
                ))}
            </FilterSection>

            {/* Body Type */}
            <FilterSection title={c.bodyType} open={openSections.bodyType} onToggle={() => toggleSection("bodyType")}>
                {VEHICLE_TYPES.map((vt) => (
                    <CheckItem key={vt.value} label={vt.label} checked={type === vt.value}
                        onChange={() => setType(type === vt.value ? "" : vt.value)} />
                ))}
            </FilterSection>

            {/* Price slider */}
            <FilterSection title={c.price} open={openSections.price} onToggle={() => toggleSection("price")}>
                <div style={{ paddingTop: 4, paddingBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                            $0
                        </span>
                        <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: priceSlider >= MAX_PRICE ? "var(--text-muted)" : "var(--accent)",
                        }}>
                            {priceSlider >= MAX_PRICE
                                ? (c as any).priceAny
                                : `$${priceSlider.toLocaleString("en-US")}`}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                            $10k
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={MAX_PRICE}
                        step={500}
                        value={priceSlider}
                        onChange={(e) => handlePriceSlider(parseInt(e.target.value))}
                        className="price-range-slider"
                        style={{
                            background: `linear-gradient(to right, var(--accent) ${(priceSlider / MAX_PRICE) * 100}%, var(--clr-surface-a30) ${(priceSlider / MAX_PRICE) * 100}%)`,
                        }}
                    />
                </div>
            </FilterSection>

            {/* Brand */}
            <FilterSection title={c.brandModel} open={openSections.brand} onToggle={() => toggleSection("brand")}>
                {BRANDS.map((b) => (
                    <CheckItem key={b} label={b} checked={brand === b}
                        onChange={() => setBrand(brand === b ? "" : b)} />
                ))}
            </FilterSection>

            {/* Mileage slider */}
            <FilterSection title={c.mileage} open={openSections.mileage} onToggle={() => toggleSection("mileage")}>
                <div style={{ paddingTop: 4, paddingBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                            0 mi
                        </span>
                        <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: mileageSlider >= MAX_MILEAGE ? "var(--text-muted)" : "var(--accent)",
                        }}>
                            {mileageSlider >= MAX_MILEAGE
                                ? (c as any).mileageAny
                                : `${mileageSlider.toLocaleString("en-US")} mi`}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                            200k
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={MAX_MILEAGE}
                        step={5000}
                        value={mileageSlider}
                        onChange={(e) => handleMileageSlider(parseInt(e.target.value))}
                        className="price-range-slider"
                        style={{
                            background: `linear-gradient(to right, var(--accent) ${(mileageSlider / MAX_MILEAGE) * 100}%, var(--clr-surface-a30) ${(mileageSlider / MAX_MILEAGE) * 100}%)`,
                        }}
                    />
                </div>
            </FilterSection>

            {/* Fuel Type */}
            <FilterSection title={c.fuel} open={openSections.fuel} onToggle={() => toggleSection("fuel")}>
                {FUEL_TYPES.map((f) => (
                    <CheckItem key={f.value} label={f.label} checked={fuelTypes.includes(f.value)}
                        onChange={() => toggleFuel(f.value)} />
                ))}
            </FilterSection>

            {/* Available only toggle */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--clr-surface-a20)" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-primary)" }}>
                        {(c as any).availableOnly}
                    </span>
                    <button
                        onClick={() => setAvailableOnly(!availableOnly)}
                        style={{
                            width: 42, height: 24, borderRadius: 12, border: "none",
                            background: availableOnly ? "#d11119" : "var(--clr-surface-a30)",
                            position: "relative", cursor: "pointer", transition: "background 0.2s",
                            flexShrink: 0,
                        }}
                    >
                        <div style={{
                            width: 18, height: 18, borderRadius: "50%", background: "white",
                            position: "absolute", top: 3,
                            left: availableOnly ? 21 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }} />
                    </button>
                </label>
            </div>

        </>
    );

    return (
        <>
            <style>{`
                /* Price range slider */
                .price-range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 3px;
                    border-radius: 2px;
                    outline: none;
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .price-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--accent, #d11119);
                    cursor: pointer;
                    border: 2.5px solid var(--primary, #121010);
                    box-shadow: 0 1px 6px rgba(0,0,0,0.45);
                    transition: transform 0.15s;
                }
                .price-range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.18);
                }
                .price-range-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--accent, #d11119);
                    cursor: pointer;
                    border: 2.5px solid var(--primary, #121010);
                    box-shadow: 0 1px 6px rgba(0,0,0,0.45);
                    transition: transform 0.15s;
                }
                .price-range-slider::-moz-range-thumb:hover {
                    transform: scale(1.18);
                }

                /* Grid */
                .cat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .cat-grid-wrap {
                    position: relative;
                    transition: opacity 0.25s ease;
                }
                .cat-grid-wrap.is-loading {
                    opacity: 0.45;
                    pointer-events: none;
                }
                .cat-grid-wrap.is-loading::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: cat-shimmer 1.2s infinite linear;
                    border-radius: 10px;
                    z-index: 1;
                }
                @keyframes cat-shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @media (max-width: 1200px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 900px)  { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 500px)  { .cat-grid { grid-template-columns: 1fr; } }
                /* Sidebar */
                .cat-sidebar {
                    width: 319px;
                    flex-shrink: 0;
                    background: var(--clr-surface-a10);
                    border-right: 1px solid var(--clr-surface-a20);
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

                    {/* Sidebar header */}
                    <div style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--clr-surface-a20)",
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="4" y1="6" x2="20" y2="6"/>
                            <line x1="4" y1="12" x2="16" y2="12"/>
                            <line x1="4" y1="18" x2="12" y2="18"/>
                        </svg>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{c.filtersTitle}</span>
                        {hasFilters && (
                            <button onClick={clearAll} style={{
                                marginLeft: "auto", fontSize: 12, color: "#d11119",
                                background: "none", border: "none", cursor: "pointer",
                                fontFamily: "inherit", fontWeight: 600,
                            }}>
                                {c.clearAll}
                            </button>
                        )}
                    </div>

                    {/* Filter sections — each row 70px collapsed */}
                    {sidebarFilters}
                </nav>

                {/* ── MAIN CONTENT ── */}
                <div style={{ flex: 1, minWidth: 0, padding: "24px 24px 64px" }}>

                    {/* COUNT ROW */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: 16,
                    }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "var(--clr-surface-a10)", border: "1px solid var(--clr-surface-a20)",
                            borderRadius: 8, padding: "7px 14px",
                        }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                                {loading ? "—" : sortedVehicles.length.toLocaleString()}
                            </span>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>
                                {loading ? c.loading : sortedVehicles.length !== 1 ? c.matches : c.match}
                            </span>
                        </div>

                        {/* Mobile filter button */}
                        <button
                            className="cat-mob-btn"
                            onClick={() => setMobileFiltersOpen(true)}
                            style={{
                                alignItems: "center", gap: 6,
                                height: 36, padding: "0 14px", borderRadius: 8,
                                border: "1.5px solid var(--clr-surface-a30)", background: "var(--clr-surface-a10)",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                                fontFamily: "inherit", color: "var(--text-primary)",
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }}>
                                <line x1="4" y1="6" x2="20" y2="6"/>
                                <line x1="4" y1="12" x2="16" y2="12"/>
                                <line x1="4" y1="18" x2="12" y2="18"/>
                            </svg>
                            {c.filters}{filterCount > 0 ? ` (${filterCount})` : ""}
                        </button>
                    </div>

                    {/* GRID */}
                    {loading && !hasLoadedOnce.current ? (
                        <div className="cat-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "var(--clr-surface-a10)", border: "1px solid var(--clr-surface-a20)" }}>
                                    <div style={{ paddingTop: "66%", position: "relative" }}>
                                        <div className="skeleton" style={{ position: "absolute", inset: 0, background: "var(--clr-surface-a20)" }} />
                                    </div>
                                    <div style={{ padding: "12px 14px 16px" }}>
                                        <div style={{ height: 13, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 8 }} />
                                        <div style={{ height: 18, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 10, width: "70%" }} />
                                        <div style={{ height: 13, borderRadius: 4, background: "var(--clr-surface-a20)", width: "45%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : sortedVehicles.length > 0 ? (
                        <div className={`cat-grid-wrap${loading ? " is-loading" : ""}`}>
                            <div className="cat-grid">
                                {sortedVehicles.map((v) => (
                                    <VehicleCard key={v.id} vehicle={v} />
                                ))}
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="cat-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "var(--clr-surface-a10)", border: "1px solid var(--clr-surface-a20)" }}>
                                    <div style={{ paddingTop: "66%", position: "relative" }}>
                                        <div className="skeleton" style={{ position: "absolute", inset: 0, background: "var(--clr-surface-a20)" }} />
                                    </div>
                                    <div style={{ padding: "12px 14px 16px" }}>
                                        <div style={{ height: 13, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 8 }} />
                                        <div style={{ height: 18, borderRadius: 4, background: "var(--clr-surface-a20)", marginBottom: 10, width: "70%" }} />
                                        <div style={{ height: 13, borderRadius: 4, background: "var(--clr-surface-a20)", width: "45%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "80px 0" }}>
                            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 22, marginBottom: 8 }}>
                                {c.noVehicles}
                            </h3>
                            <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>{c.tryFilters}</p>
                            <button onClick={clearAll} style={{
                                background: "#d11119", color: "white", border: "none",
                                borderRadius: 100, padding: "13px 32px",
                                fontSize: 14, fontWeight: 700, cursor: "pointer",
                            }}>
                                {c.viewAll}
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
                    <div onClick={(e) => e.stopPropagation()} style={{
                        position: "relative", zIndex: 1,
                        background: "var(--clr-surface-a10)", width: 319, height: "100%",
                        overflowY: "auto", flexShrink: 0,
                        boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
                    }}>
                        {/* Drawer header */}
                        <div style={{
                            padding: "18px 20px", borderBottom: "1px solid var(--clr-surface-a20)",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            position: "sticky", top: 0, background: "var(--clr-surface-a10)", zIndex: 2,
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{c.filtersTitle}</span>
                            <button onClick={() => setMobileFiltersOpen(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text-muted)", lineHeight: 1 }}>
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
                                {c.viewResults} {sortedVehicles.length} {c.results}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
