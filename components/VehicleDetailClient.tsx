'use client';

import { useState } from "react";
import Image from "next/image";
import { Vehicle } from "@/components/VehicleCard";
import ContactForm from "@/components/ContactForm";

interface Props {
    vehicle: Vehicle;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

export default function VehicleDetailClient({ vehicle }: Props) {
    const [activeImg, setActiveImg] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);

    const images = vehicle.images?.length ? vehicle.images : ["/placeholder-car.jpg"];
    const vehicleTitle = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const priceFormatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(vehicle.price);
    const mileageFormatted = vehicle.mileage === 0
        ? "0 km — ¡Nuevo!"
        : new Intl.NumberFormat("es-AR").format(vehicle.mileage) + " km";

    async function handleWhatsApp() {
        // Log click
        const sellerCode = getCookie("referral");
        fetch("/api/whatsapp-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vehicleSlug: vehicle.slug,
                vehicleName: vehicleTitle,
                sellerCode: sellerCode || null,
            }),
        }).catch(() => { });

        // Open WhatsApp
        const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || "5491112345678";
        const text = encodeURIComponent(
            `Hola! Me interesa el ${vehicleTitle} a ${priceFormatted}. ¿Podés darme más información?`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }

    return (
        <div className="container" style={{ padding: "40px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
                {/* Left: Gallery */}
                <div>
                    {/* Main image */}
                    <div style={{
                        borderRadius: "var(--radius-xl)", overflow: "hidden", aspectRatio: "4/3",
                        position: "relative", background: "var(--gray-100)", marginBottom: 12
                    }}>
                        <Image
                            src={images[activeImg]}
                            alt={vehicleTitle}
                            fill
                            style={{ objectFit: "cover" }}
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    style={{
                                        width: 72, height: 56, borderRadius: "var(--radius-sm)", overflow: "hidden",
                                        border: i === activeImg ? "3px solid var(--accent)" : "3px solid transparent",
                                        position: "relative", cursor: "pointer", background: "none", padding: 0,
                                        transition: "border-color 0.15s"
                                    }}
                                >
                                    <Image src={img} alt="" fill style={{ objectFit: "cover" }} sizes="72px" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)" }}>
                    {/* Badges */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {vehicle.isFeatured && <span className="badge badge-gold" style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Destacado</span>}
                        <span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{vehicle.type}</span>
                        {vehicle.mileage === 0 && <span className="badge badge-success">0 km</span>}
                    </div>

                    <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "var(--primary)", marginBottom: 6, lineHeight: 1.2 }}>
                        {vehicleTitle}
                    </h1>

                    <p style={{ fontSize: 34, fontWeight: 900, color: "var(--accent)", marginBottom: 24 }}>
                        {priceFormatted}
                    </p>

                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28,
                        background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: 20
                    }}>
                        {[
                            { label: "Kilometraje", value: mileageFormatted, icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="13" r="3" /></> },
                            { label: "Combustible", value: vehicle.fuelType || "—", icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
                            { label: "Transmisión", value: vehicle.transmission || "—", icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
                            { label: "Color", value: vehicle.color || "—", icon: <><path d="m13.4 10.6-2.8-2.8" /><path d="M11 4.5l6 6a1.9 1.9 0 0 1 0 2.7l-9 9a1.9 1.9 0 0 1-2.7 0l-3-3a1.9 1.9 0 0 1 0-2.7l9-9a1.9 1.9 0 0 1 2.7 0z" /><path d="M4.5 9.5 9.5 4.5" /><path d="M2 22h20" /></> },
                            { label: "Año", value: vehicle.year?.toString() || "—", icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
                            { label: "Tipo", value: vehicle.type || "—", icon: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></> },
                        ].map((spec) => (
                            <div key={spec.label}>
                                <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--gray-500)", marginBottom: 4 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{spec.icon}</svg>
                                    {spec.label}
                                </p>
                                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{spec.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    {vehicle.description && (
                        <div style={{ marginBottom: 28, padding: "16px 20px", background: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>
                            <h3 style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 8, fontSize: 15 }}>Descripción</h3>
                            <p style={{ color: "var(--gray-600)", fontSize: 15, lineHeight: 1.7 }}>{vehicle.description}</p>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <button
                            onClick={handleWhatsApp}
                            className="btn btn-whatsapp btn-lg"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            Consultar por WhatsApp
                        </button>
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="btn btn-dark btn-lg"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            Enviar Consulta
                        </button>
                    </div>

                    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "var(--gray-400)", marginTop: 16 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Tus datos son confidenciales
                    </p>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}>
                    <div className="modal-box">
                        <button
                            onClick={() => setShowContactModal(false)}
                            style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: 20, color: "var(--gray-400)", lineHeight: 1 }}
                        >✕</button>
                        <h2 style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 6, fontSize: 22 }}>Enviar Consulta</h2>
                        <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>Completá el formulario y nos comunicamos a la brevedad.</p>
                        <ContactForm
                            vehicleSlug={vehicle.slug}
                            vehicleName={vehicleTitle}
                            onClose={() => setShowContactModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Mobile responsive fix */}
            <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
