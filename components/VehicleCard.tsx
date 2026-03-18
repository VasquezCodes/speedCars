'use client';

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

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
    status?: string;
    description?: string;
    createdAt?: string;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
    const { lang, t } = useLanguage();

    const price = new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(vehicle.price);

    const mileageDisplay = `${vehicle.mileage.toLocaleString("en-US")} mi`;

    const imageUrl = vehicle.images?.[0] || "/placeholder-car.jpg";

    return (
        <Link href={`/autos/${vehicle.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <article
                style={{
                    background: "var(--clr-surface-a10)",
                    border: "1px solid var(--clr-surface-a20)",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    cursor: "pointer",
                    transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.5)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "var(--clr-surface-a30)";
                    const img = e.currentTarget.querySelector(".vc-img") as HTMLElement;
                    if (img) img.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--clr-surface-a20)";
                    const img = e.currentTarget.querySelector(".vc-img") as HTMLElement;
                    if (img) img.style.transform = "scale(1)";
                }}
            >
                {/* ── Image ── */}
                <div style={{
                    position: "relative",
                    paddingTop: "66.66%", /* 3:2 */
                    overflow: "hidden",
                    background: "var(--clr-surface-a20)",
                }}>
                    <Image
                        src={imageUrl}
                        alt={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                        fill
                        className="vc-img"
                        style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                        sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        quality={85}
                        unoptimized
                    />

                    {/* ⋮ button — bottom right of image */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        style={{
                            position: "absolute", bottom: 10, right: 10, zIndex: 2,
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--clr-surface-a10)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--clr-surface-a20)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--clr-surface-a10)"; }}
                        aria-label="Opciones"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--clr-surface-a50)">
                            <circle cx="12" cy="5" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="12" cy="19" r="1.5"/>
                        </svg>
                    </button>
                </div>

                {/* ── Content ── */}
                <div style={{ padding: "12px 14px 0 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{
                        fontSize: 14, fontWeight: 600, color: "var(--clr-light-a0)",
                        margin: "0 0 6px", lineHeight: 1.35,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {vehicle.year} {vehicle.brand} {vehicle.model}
                    </p>

                    {/* Price + km */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--clr-light-a0)", letterSpacing: "-0.02em" }}>
                            ${price}*
                        </span>
                        <span style={{ fontSize: 13, color: "var(--clr-surface-a50)", fontWeight: 500 }}>
                            {mileageDisplay}
                        </span>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: "10px 14px 13px",
                    borderTop: "1px solid var(--clr-surface-a20)",
                    marginTop: "auto",
                }}>
                    <p style={{ fontSize: 11, color: "var(--clr-surface-a40)", margin: "0 0 1px", lineHeight: 1.4 }}>
                        {t.catalog.availableAt}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--clr-surface-a50)", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                        FF Speed Cars
                    </p>
                </div>
            </article>
        </Link>
    );
}
