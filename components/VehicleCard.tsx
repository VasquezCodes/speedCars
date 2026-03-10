'use client';

import Image from "next/image";
import Link from "next/link";

export interface Vehicle {
    id: string;
    slug: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    type: string;
    mileage: number;
    fuelType?: string;
    transmission?: string;
    color?: string;
    images: string[];
    isFeatured?: boolean;
    isAvailable?: boolean;
    description?: string;
    createdAt?: string;
}

interface VehicleCardProps {
    vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    const priceFormatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(vehicle.price);

    const mileageFormatted = vehicle.mileage === 0
        ? "0 km"
        : new Intl.NumberFormat("es-AR").format(vehicle.mileage) + " km";

    const imageUrl = vehicle.images?.[0] || "/placeholder-car.jpg";

    return (
        <Link href={`/autos/${vehicle.slug}`} style={{ textDecoration: "none" }}>
            <article className="card" style={{ cursor: "pointer" }}>
                {/* Image */}
                <div style={{ position: "relative", height: 200, overflow: "hidden", background: "var(--gray-100)" }}>
                    <Image
                        src={imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                        fill
                        style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {vehicle.isFeatured && (
                        <div style={{ position: "absolute", top: 12, left: 12 }}>
                            <span className="badge badge-gold">⭐ Destacado</span>
                        </div>
                    )}
                    {vehicle.mileage === 0 && (
                        <div style={{ position: "absolute", top: 12, right: 12 }}>
                            <span className="badge badge-success">0 km</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: "20px", background: "var(--primary-light)", borderTop: "2px solid var(--accent)" }}>
                    <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{vehicle.brand} · {vehicle.year}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--white)", marginBottom: 12, lineHeight: 1.3 }}>
                        {vehicle.brand} {vehicle.model}
                    </h3>

                    {/* Specs */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gray-300)", fontSize: 13 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            {vehicle.fuelType || "N/A"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gray-300)", fontSize: 13 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            {vehicle.transmission || "N/A"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gray-300)", fontSize: 13 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            {vehicle.year || "N/A"}
                        </div>
                        <SpecBadge icon="📍" label={mileageFormatted} />
                    </div>

                    {/* Price */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <p className="price-display" style={{ fontSize: 24, fontWeight: 900, color: "var(--white)", letterSpacing: "-0.03em" }}>{priceFormatted}</p>
                            <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 4 }}>
                                {vehicle.mileage === 0 ? "Nuevo (0km)" : "Consultar financiación"}
                            </p>
                        </div>
                        <div style={{ color: "var(--accent)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function SpecBadge({ icon, label }: { icon: string; label: string }) {
    return (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--gray-300)" }}>
            {icon} {label}
        </span>
    );
}
