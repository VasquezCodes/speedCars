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

    const isSold = vehicle.status === "Vendido";

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
                    border: `1px solid ${isSold ? "rgba(160,30,30,0.35)" : "var(--clr-surface-a20)"}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    cursor: "pointer",
                    transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
                    opacity: isSold ? 0.88 : 1,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = isSold
                        ? "0 6px 20px rgba(160,30,30,0.18)"
                        : "0 8px 28px rgba(0,0,0,0.5)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = isSold
                        ? "rgba(160,30,30,0.55)"
                        : "var(--clr-surface-a30)";
                    if (!isSold) {
                        const img = e.currentTarget.querySelector(".vc-img") as HTMLElement;
                        if (img) img.style.transform = "scale(1.04)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = isSold
                        ? "rgba(160,30,30,0.35)"
                        : "var(--clr-surface-a20)";
                    if (!isSold) {
                        const img = e.currentTarget.querySelector(".vc-img") as HTMLElement;
                        if (img) img.style.transform = "scale(1)";
                    }
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
                        style={{
                            objectFit: "cover",
                            transition: "transform 0.4s ease, filter 0.3s ease",
                            filter: isSold ? "grayscale(40%) brightness(0.65)" : "none",
                        }}
                        sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        quality={85}
                        unoptimized
                    />

                    {/* ── SOLD overlay ── */}
                    {isSold && (
                        <>
                            {/* Dark scrim */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 2,
                                background: "linear-gradient(160deg, rgba(80,10,10,0.55) 0%, rgba(10,5,5,0.38) 100%)",
                            }} />

                            {/* Diagonal ribbon — top-left */}
                            <div style={{
                                position: "absolute",
                                top: 20,
                                left: -34,
                                width: 136,
                                paddingTop: 7,
                                paddingBottom: 7,
                                background: "linear-gradient(90deg, #8B1111 0%, #C0191A 100%)",
                                transform: "rotate(-45deg)",
                                zIndex: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 3px 14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
                                gap: 5,
                            }}>
                                {/* checkmark icon */}
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                    <path d="M2 6.5L4.8 9.5L10 3" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{
                                    fontSize: 9.5,
                                    fontWeight: 800,
                                    letterSpacing: "0.2em",
                                    color: "#fff",
                                    textTransform: "uppercase",
                                    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                                }}>
                                    {lang === "en" ? "SOLD" : "VENDIDO"}
                                </span>
                            </div>

                            {/* Center stamp */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                            }}>
                                <div style={{
                                    border: "2px solid rgba(220,50,50,0.75)",
                                    borderRadius: 4,
                                    padding: "5px 14px",
                                    transform: "rotate(-8deg)",
                                    backdropFilter: "blur(1px)",
                                    background: "rgba(0,0,0,0.18)",
                                }}>
                                    <span style={{
                                        fontSize: 22,
                                        fontWeight: 900,
                                        letterSpacing: "0.25em",
                                        color: "rgba(230,60,60,0.92)",
                                        textTransform: "uppercase",
                                        textShadow: "0 0 20px rgba(200,30,30,0.5)",
                                        display: "block",
                                        lineHeight: 1,
                                    }}>
                                        SOLD
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ⋮ button — bottom right of image (hidden when sold) */}
                    {!isSold && (
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
                    )}
                </div>

                {/* ── Content ── */}
                <div style={{ padding: "12px 14px 0 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <p style={{
                            fontSize: 14, fontWeight: 600,
                            color: isSold ? "var(--clr-surface-a50)" : "var(--clr-light-a0)",
                            margin: 0, lineHeight: 1.35,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            flex: 1,
                        }}>
                            {vehicle.year} {vehicle.brand} {vehicle.model}
                        </p>
                        {isSold && (
                            <span style={{
                                flexShrink: 0,
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "#C0191A",
                                background: "rgba(160,20,20,0.14)",
                                border: "1px solid rgba(160,20,20,0.3)",
                                borderRadius: 4,
                                padding: "2px 7px",
                                lineHeight: 1.6,
                            }}>
                                {lang === "en" ? "Sold" : "Vendido"}
                            </span>
                        )}
                    </div>

                    {/* Price + km */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                        <span style={{
                            fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em",
                            color: isSold ? "var(--clr-surface-a40)" : "var(--clr-light-a0)",
                            textDecoration: isSold ? "line-through" : "none",
                            textDecorationColor: "rgba(180,30,30,0.6)",
                        }}>
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
                    borderTop: `1px solid ${isSold ? "rgba(160,30,30,0.2)" : "var(--clr-surface-a20)"}`,
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div>
                        <p style={{ fontSize: 11, color: "var(--clr-surface-a40)", margin: "0 0 1px", lineHeight: 1.4 }}>
                            {isSold ? (lang === "en" ? "Sold at" : "Vendido en") : t.catalog.availableAt}
                        </p>
                        <p style={{ fontSize: 12, color: isSold ? "var(--clr-surface-a40)" : "var(--clr-surface-a50)", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                            FF Speed Cars
                        </p>
                    </div>
                    {isSold && (
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "rgba(140,20,20,0.18)",
                            border: "1px solid rgba(160,20,20,0.35)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8.5L6.2 12L13 4" stroke="#C0191A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
