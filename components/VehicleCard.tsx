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
            <article className="card vehicle-card-minimal" style={{ 
                cursor: "pointer", 
                border: "none", 
                borderRadius: "0", 
                background: "var(--white)",
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
                const img = e.currentTarget.querySelector('.vehicle-img') as HTMLElement;
                if(img) img.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('.vehicle-img') as HTMLElement;
                if(img) img.style.transform = "scale(1)";
            }}
            >
                {/* Image Area - Aspect ratio 4:3 */}
                <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "var(--gray-100)", marginBottom: "20px" }}>
                    <Image
                        src={imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                        fill
                        className="vehicle-img"
                        style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Badges Overlay */}
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: "8px", flexDirection: "column" }}>
                        {vehicle.isFeatured && (
                            <span style={{
                                background: "var(--text-primary)", 
                                color: "var(--white)",
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                padding: "6px 12px",
                                display: "inline-block",
                                width: "fit-content"
                            }}>Destacado</span>
                        )}
                        {vehicle.mileage === 0 && (
                            <span style={{
                                background: "var(--accent)", 
                                color: "var(--white)",
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                padding: "6px 12px",
                                display: "inline-block",
                                width: "fit-content"
                            }}>0 KM</span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: "0 8px 16px 8px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{vehicle.brand} · {vehicle.year}</span>
                            <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                                {vehicle.model}
                            </h3>
                        </div>
                        <p style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.01em", margin: 0 }}>
                            {priceFormatted}
                        </p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                        <div style={{ 
                            display: "flex", 
                            gap: "16px", 
                            flexWrap: "wrap",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-lato), sans-serif",
                            fontWeight: 600
                        }}>
                            <SpecItem label={mileageFormatted} />
                            <SpecItem label={vehicle.transmission || "Automático"} />
                            <SpecItem label={vehicle.fuelType || "Nafta"} />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function SpecItem({ label }: { label: string }) {
    return (
        <span style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            border: "1px solid var(--gray-200)",
            padding: "4px 10px",
            borderRadius: "100px",
            background: "var(--gray-50)"
        }}>
            {label}
        </span>
    );
}
