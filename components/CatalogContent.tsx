'use client';

import { useState, useEffect, useCallback } from "react";
import VehicleCard, { Vehicle } from "@/components/VehicleCard";
import { useRouter, useSearchParams } from "next/navigation";

const BRANDS = ["Toyota", "Ford", "Chevrolet", "Honda", "Volkswagen", "Renault", "Fiat", "Nissan", "Hyundai", "Peugeot", "Citroën", "Otro"];
const TYPES = ["Sedán", "SUV", "Pickup", "Hatchback", "Coupé", "Minivan"];

interface CatalogContentProps {
    searchParams: Promise<{ brand?: string; type?: string; maxPrice?: string; search?: string }>;
}

export default function CatalogContent({ searchParams }: CatalogContentProps) {
    const router = useRouter();
    const urlParams = useSearchParams();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [brand, setBrand] = useState(urlParams.get("brand") || "");
    const [type, setType] = useState(urlParams.get("type") || "");
    const [maxPrice, setMaxPrice] = useState(urlParams.get("maxPrice") || "");
    const [search, setSearch] = useState(urlParams.get("search") || "");

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (brand) params.set("brand", brand);
            if (type) params.set("type", type);
            if (maxPrice) params.set("maxPrice", maxPrice);
            if (search) params.set("search", search);

            const res = await fetch(`/api/vehicles?${params.toString()}`);
            const data = await res.json();
            setVehicles(Array.isArray(data) ? data : []);
        } catch {
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [brand, type, maxPrice, search]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    function handleClear() {
        setBrand("");
        setType("");
        setMaxPrice("");
        setSearch("");
    }

    const hasFilters = brand || type || maxPrice || search;

    return (
        <div className="container" style={{ padding: "32px 24px 64px" }}>
            {/* Filter bar */}
            <div style={{
                background: "var(--white)", borderRadius: "var(--radius-xl)", padding: "20px 24px",
                border: "1px solid var(--gray-200)", marginBottom: 32, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
            }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar marca, modelo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: 180 }}
                />
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="form-input" style={{ minWidth: 140 }}>
                    <option value="">Todas las marcas</option>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} className="form-input" style={{ minWidth: 140 }}>
                    <option value="">Tipo de vehículo</option>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="form-input" style={{ minWidth: 160 }}>
                    <option value="">Cualquier precio</option>
                    <option value="10000">Hasta USD 10.000</option>
                    <option value="20000">Hasta USD 20.000</option>
                    <option value="30000">Hasta USD 30.000</option>
                    <option value="50000">Hasta USD 50.000</option>
                    <option value="80000">Hasta USD 80.000</option>
                </select>
                {hasFilters && (
                    <button onClick={handleClear} className="btn btn-outline btn-sm">
                        ✕ Limpiar
                    </button>
                )}
            </div>

            {/* Results count */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: "var(--gray-500)", fontSize: 15 }}>
                    {loading ? "Cargando..." : `${vehicles.length} vehículo${vehicles.length !== 1 ? "s" : ""} encontrado${vehicles.length !== 1 ? "s" : ""}`}
                </p>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="vehicle-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                            <div style={{ height: 200 }} className="skeleton" />
                            <div style={{ padding: 20, background: "var(--white)" }}>
                                <div style={{ height: 16, borderRadius: 4, marginBottom: 8 }} className="skeleton" />
                                <div style={{ height: 24, borderRadius: 4, marginBottom: 16 }} className="skeleton" />
                                <div style={{ height: 40, borderRadius: 4 }} className="skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : vehicles.length > 0 ? (
                <div className="vehicle-grid">
                    {vehicles.map((vehicle) => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <p style={{ fontSize: 48, marginBottom: 20 }}>🔍</p>
                    <h3 style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 12, fontSize: 22 }}>
                        No encontramos vehículos
                    </h3>
                    <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>
                        Probá cambiando los filtros o búsqueda.
                    </p>
                    <button onClick={handleClear} className="btn btn-primary">
                        Ver todos los vehículos
                    </button>
                </div>
            )}
        </div>
    );
}
