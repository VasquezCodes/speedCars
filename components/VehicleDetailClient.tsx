'use client';

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { CalendarCheck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { AppointmentForm } from '@/components/AppointmentForm';
import { StatusBadge, FeaturedBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';

const COLOR_MAP: Record<string, { hex: string, border: string }> = {
    "Blanco": { hex: "#FFFFFF", border: "#e5e7eb" },
    "Negro": { hex: "#000000", border: "#000000" },
    "Gris Plata": { hex: "#D8D8D8", border: "#c0c0c0" },
    "Gris Oscuro": { hex: "#595959", border: "#404040" },
    "Rojo": { hex: "#CC0000", border: "#b30000" },
    "Azul": { hex: "#0033A0", border: "#002b80" },
    "Beige": { hex: "#F5F5DC", border: "#e6e6cc" },
    "Marrón": { hex: "#654321", border: "#54381c" },
    "Verde": { hex: "#2E5A27", border: "#254a20" },
};
import ContactForm from './ContactForm';


interface Props {
    vehicle: Vehicle;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

const getBrandLogo = (brand: string) => {
    const normalize = brand.toLowerCase().trim();
    const map: Record<string, string> = {
        "fiat": "fiat-svgrepo-com.svg",
        "ford": "ford-svgrepo-com.svg",
        "honda": "honda-svgrepo-com.svg",
        "infiniti": "infiniti-svgrepo-com.svg",
        "jeep": "jeep-alt-svgrepo-com.svg",
        "kia": "kia-svgrepo-com.svg",
        "land rover": "land-rover-svgrepo-com.svg",
        "lexus": "lexus-svgrepo-com.svg",
        "mazda": "mazda-alt-svgrepo-com.svg",
        "mercedes": "mercedes-benz-alt-svgrepo-com.svg",
        "mercedes-benz": "mercedes-benz-alt-svgrepo-com.svg",
        "mercedes benz": "mercedes-benz-alt-svgrepo-com.svg",
        "mercedez": "mercedes-benz-alt-svgrepo-com.svg",
        "mitsubishi": "mitsubishi-svgrepo-com.svg",
        "nissan": "nissan-svgrepo-com.svg",
        "volkswagen": "volkswagen-1.svg",
        "vw": "volkswagen-1.svg",
        "toyota": "toyota-svgrepo-com.svg",
        "chevrolet": "Chevrolet.svg",
        "audi": "Audi_Logo_1995.svg",
        "bmw": "BMW_logo_(gray).svg",
        "peugeot": "peugeot-svgrepo-com.svg",
        "renault": "renault-svgrepo-com.svg",
        "citroen": "Citroen_2016_logo.svg",
        "citroën": "Citroen_2016_logo.svg",
        "dodge": "Dodge_black_logo.svg",
        "hummer": "Hummer_wordmark.svg",
    };
    return map[normalize] || `${normalize.replace(/\s+/g, '-')}-svgrepo-com.svg`;
};

const FUEL_EN: Record<string, string> = {
    'Nafta': 'Gasoline', 'Diesel': 'Diesel', 'Híbrido': 'Hybrid',
    'Eléctrico': 'Electric', 'GNC': 'CNG',
};
const TRANSMISSION_EN: Record<string, string> = {
    'Automático': 'Automatic', 'Manual': 'Manual',
};
const COLOR_EN: Record<string, string> = {
    'Blanco': 'White', 'Negro': 'Black', 'Gris Plata': 'Silver',
    'Gris Oscuro': 'Dark Gray', 'Rojo': 'Red', 'Azul': 'Blue',
    'Beige': 'Beige', 'Marrón': 'Brown', 'Verde': 'Green',
};

export default function VehicleDetailClient({ vehicle }: Props) {
    const { lang, t } = useLanguage();
    const vd = t.vehicleDetail;
    const [activeImg, setActiveImg] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [referrerId, setReferrerId] = useState<string | undefined>(undefined);
    const touchStartX = useRef<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const code = getCookie("referral");
        if (code) setReferrerId(code);
    }, []);

    useEffect(() => {
        setLogoError(false);
        setActiveImg(0);
    }, [vehicle.slug]);

    const brandLogo = getBrandLogo(vehicle.brand);

    const images = vehicle.images?.length ? vehicle.images : ["/placeholder-car.jpg"];
    const vehicleTitle = `${vehicle.brand} ${vehicle.model}`;
    const priceFormatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(vehicle.price);
    const mileageFormatted = (() => {
        if (lang === 'en') {
            if (vehicle.mileage === 0) return vd.mileageNew;
            const miles = Math.round(vehicle.mileage * 0.621371);
            return `${miles.toLocaleString("en-US")} mi`;
        }
        if (vehicle.mileage === 0) return vd.mileageNew;
        return `${vehicle.mileage.toLocaleString("es-AR")} km`;
    })();

    function handlePrevImg() {
        setActiveImg(i => (i === 0 ? images.length - 1 : i - 1));
    }
    function handleNextImg() {
        setActiveImg(i => (i === images.length - 1 ? 0 : i + 1));
    }

    function handleTouchStart(e: React.TouchEvent) {
        if (images.length < 2) return;
        touchStartX.current = e.touches[0].clientX;
        isDragging.current = true;
        if (trackRef.current) trackRef.current.style.transition = 'none';
    }
    function handleTouchMove(e: React.TouchEvent) {
        if (!isDragging.current || touchStartX.current === null || !trackRef.current) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        trackRef.current.style.transform = `translateX(calc(-33.333% + ${delta}px))`;
    }
    function handleTouchEnd(e: React.TouchEvent) {
        if (!isDragging.current || touchStartX.current === null || !trackRef.current) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        isDragging.current = false;
        const track = trackRef.current;
        if (Math.abs(delta) > 50) {
            const targetPct = delta > 0 ? '-66.666%' : '0%';
            track.style.transition = 'transform 0.28s ease-out';
            track.style.transform = `translateX(${targetPct})`;
            setTimeout(() => {
                track.style.transition = 'none';
                track.style.transform = 'translateX(-33.333%)';
                setActiveImg(i => delta > 0
                    ? (i === images.length - 1 ? 0 : i + 1)
                    : (i === 0 ? images.length - 1 : i - 1)
                );
            }, 280);
        } else {
            track.style.transition = 'transform 0.2s ease-out';
            track.style.transform = 'translateX(-33.333%)';
        }
        touchStartX.current = null;
    }

    async function handleWhatsApp() {
        const sellerCode = getCookie("referral");
        fetch("/api/whatsapp-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vehicleSlug: vehicle.slug,
                vehicleName: `${vehicleTitle} ${vehicle.year}`,
                sellerCode: sellerCode || null,
            }),
        }).catch(() => { });

        const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || "5491112345678";
        const text = encodeURIComponent(
            `${vd.whatsappGreeting} ${vehicleTitle} ${vehicle.year} a ${priceFormatted}. ${vd.whatsappQuestion}`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }

    const fuelDisplay = vehicle.fuelType
        ? (lang === 'en' ? (FUEL_EN[vehicle.fuelType] ?? vehicle.fuelType) : vehicle.fuelType)
        : "—";
    const transmissionDisplay = vehicle.transmission
        ? (lang === 'en' ? (TRANSMISSION_EN[vehicle.transmission] ?? vehicle.transmission) : vehicle.transmission)
        : "—";
    const colorDisplay = vehicle.color
        ? (lang === 'en' ? (COLOR_EN[vehicle.color] ?? vehicle.color) : vehicle.color)
        : null;

    const specRows = [
        { label: vd.mileage, value: mileageFormatted },
        { label: vd.fuel, value: fuelDisplay },
        { label: vd.transmission, value: transmissionDisplay },
    ];

    return (
        <div style={{ backgroundColor: "var(--primary)", minHeight: "100vh" }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Outfit:wght@300;400;500;700;800&display=swap');

                /* ── Base ───────────────────────────────────────── */
                .vd-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 60px 24px;
                    font-family: 'Manrope', sans-serif;
                    color: var(--text-primary);
                }
                .vd-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 80px;
                    align-items: start;
                }
                .vd-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: clamp(28px, 3.5vw, 44px);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                    text-transform: uppercase;
                }
                .vd-year {
                    font-family: 'Outfit', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    color: var(--accent);
                    margin-bottom: 12px;
                    display: block;
                }
                .vd-price {
                    font-family: 'Outfit', sans-serif;
                    font-size: 32px;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                    margin: 24px 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 4px;
                }
                .vd-price span {
                    font-size: 18px;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-top: 6px;
                }
                .vd-badge-group {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }
                .vd-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 14px;
                    border: 1px solid var(--clr-surface-a30);
                    border-radius: 40px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }
                .vd-badge-accent {
                    border: 1.5px solid #fca5a5;
                    color: #dc2626;
                    background: rgba(254, 242, 242, 0.95);
                }
                .vd-badge-status {
                    border: 1.5px solid var(--clr-surface-a30);
                    color: var(--text-secondary);
                    font-weight: 800;
                    padding: 8px 16px;
                }
                .vd-specs {
                    margin-bottom: 48px;
                }
                .vd-spec-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 0;
                    border-bottom: 1px solid var(--clr-surface-a20);
                }
                .vd-spec-label {
                    color: var(--text-muted);
                    font-size: 15px;
                    font-weight: 500;
                }
                .vd-spec-value {
                    color: var(--text-primary);
                    font-size: 16px;
                    font-weight: 600;
                    text-align: right;
                }
                .vd-thumb {
                    transition: all 0.3s ease;
                    opacity: 0.6;
                }
                .vd-thumb:hover, .vd-thumb.active {
                    opacity: 1;
                }
                .vd-desc {
                    font-size: 16px;
                    line-height: 1.8;
                    color: var(--text-secondary);
                    margin-bottom: 48px;
                }
                .vd-btn-black {
                    background: var(--clr-surface-a20);
                    color: #fff;
                    border: none;
                    padding: 20px 32px;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.3s ease;
                    font-family: 'Outfit', sans-serif;
                }
                .vd-btn-black:hover {
                    background: var(--clr-surface-a30);
                }
                .vd-btn-whatsapp {
                    background: var(--clr-surface-a10);
                    color: var(--text-primary);
                    border: 1px solid var(--clr-surface-a30);
                    padding: 20px 32px;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-family: 'Outfit', sans-serif;
                }
                .vd-btn-whatsapp:hover {
                    border-color: #25D366;
                    color: #25D366;
                    background: var(--clr-surface-a20);
                }

                /* ── Mobile gallery ─────────────────────────────── */
                .vd-gallery-mobile {
                    display: none;
                    position: relative;
                    width: 100%;
                    background: var(--clr-surface-a10);
                }
                .vd-gallery-mobile-img {
                    width: 100%;
                    aspect-ratio: 4/3;
                    position: relative;
                    overflow: hidden;
                }
                .vd-gallery-mobile-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    background: rgba(0,0,0,0.38);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #fff;
                    transition: background 0.2s;
                }
                .vd-gallery-mobile-arrow:hover {
                    background: rgba(0,0,0,0.6);
                }
                .vd-gallery-mobile-arrow-left {
                    left: 12px;
                }
                .vd-gallery-mobile-arrow-right {
                    right: 12px;
                }
                .vd-gallery-mobile-dots {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 0 8px;
                    background: var(--primary);
                }
                .vd-gallery-mobile-dot {
                    height: 5px;
                    border-radius: 3px;
                    background: var(--clr-surface-a30);
                    transition: all 0.25s ease;
                    width: 8px;
                }
                .vd-gallery-mobile-dot.active {
                    background: var(--accent, #dc2626);
                    width: 22px;
                }

                /* ── Mobile info block ──────────────────────────── */
                .vd-info-mobile {
                    display: none;
                    padding: 20px 16px 32px;
                    font-family: 'Manrope', sans-serif;
                }
                .vd-info-mobile-title-wrap {
                    display: flex;
                    align-items: baseline;
                    justify-content: flex-start;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .vd-info-mobile-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                    line-height: 1.05;
                }
                .vd-info-mobile-year {
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-muted);
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .vd-gallery-brand-pill {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    z-index: 10;
                    background: rgba(30,28,28,0.88);
                    backdrop-filter: blur(6px);
                    border-radius: 10px;
                    padding: 6px 10px;
                    box-shadow: 0 1px 8px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 80px;
                    max-height: 44px;
                }
                .vd-gallery-brand-pill img {
                    height: 28px;
                    width: auto;
                    max-width: 60px;
                    object-fit: contain;
                }
                .vd-info-mobile-chips {
                    font-size: 13px;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-bottom: 16px;
                    line-height: 1.6;
                }
                .vd-info-mobile-price {
                    font-family: 'Outfit', sans-serif;
                    font-size: 30px;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                    margin-bottom: 12px;
                }
                .vd-info-mobile-trust {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                }
                .vd-info-mobile-cta {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: var(--accent, #dc2626);
                    color: #fff;
                    border: none;
                    width: 100%;
                    height: 52px;
                    border-radius: 999px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    margin-bottom: 24px;
                }
                .vd-info-mobile-cta:hover {
                    background: var(--accent-hover, #b91c1c);
                }
                .vd-info-mobile-separator {
                    border: none;
                    border-top: 1px solid var(--clr-surface-a20);
                    margin: 0 0 24px;
                }
                .vd-info-mobile-spec-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--clr-surface-a20);
                }
                .vd-info-mobile-spec-label {
                    font-size: 14px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .vd-info-mobile-spec-value {
                    font-size: 14px;
                    color: var(--text-primary);
                    font-weight: 600;
                    text-align: right;
                }
                .vd-info-mobile-desc {
                    font-size: 14px;
                    line-height: 1.75;
                    color: var(--text-secondary);
                    margin-top: 20px;
                }

                /* ── Desktop gallery ────────────────────────────── */
                .vd-gallery-desktop {
                    display: block;
                }

                /* ── Desktop info column ────────────────────────── */
                .vd-info-desktop {
                    display: block;
                    position: sticky;
                    top: calc(var(--nav-height, 80px) + 40px);
                }

                /* ── Responsive breakpoint ──────────────────────── */
                @media (max-width: 992px) {
                    .vd-container {
                        display: none;
                    }
                    .vd-gallery-mobile {
                        display: block;
                    }
                    .vd-info-mobile {
                        display: block;
                    }
                }
                @media (min-width: 993px) {
                    .vd-gallery-mobile {
                        display: none !important;
                    }
                    .vd-info-mobile {
                        display: none !important;
                    }
                }
                `}} />

            {/* ── MOBILE GALLERY ─────────────────────────────────────────────── */}
            <div className="vd-gallery-mobile">
                {/* Outer wrapper: clips the sliding track */}
                <div
                    className="vd-gallery-mobile-img"
                    style={{ overflow: "hidden" }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Sliding track: 3 images (prev | current | next) */}
                    <div
                        ref={trackRef}
                        style={{
                            display: "flex",
                            width: "300%",
                            height: "100%",
                            transform: "translateX(-33.333%)",
                            willChange: "transform",
                        }}
                    >
                        {[
                            images[(activeImg - 1 + images.length) % images.length],
                            images[activeImg],
                            images[(activeImg + 1) % images.length],
                        ].map((src, i) => (
                            <div key={i} style={{ width: "33.333%", height: "100%", position: "relative", flexShrink: 0 }}>
                                <Image
                                    src={src}
                                    alt={vehicleTitle}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    priority={i === 1}
                                    sizes="100vw"
                                    quality={100}
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>

                    {/* Back arrow overlay */}
                    <Link
                        href="/autos"
                        aria-label={vd.backToCatalog}
                        style={{
                            position: "absolute", top: 12, left: 12, zIndex: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(255,255,255,0.88)",
                            backdropFilter: "blur(6px)",
                            boxShadow: "0 1px 8px rgba(0,0,0,0.15)",
                            color: "#111", textDecoration: "none",
                        }}
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </Link>

                    {/* Status badge overlay */}
                    {vehicle.status && vehicle.status !== "Disponible" && (
                        <div style={{ position: "absolute", top: 12, left: 56, zIndex: 5 }}>
                            <StatusBadge status={vehicle.status} variant="overlay" />
                        </div>
                    )}
                </div>

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="vd-gallery-mobile-dots">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={`vd-gallery-mobile-dot${i === activeImg ? ' active' : ''}`}
                                aria-label={`Ir a imagen ${i + 1}`}
                                style={{ border: "none", padding: 0, cursor: "pointer" }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── MOBILE INFO BLOCK ──────────────────────────────────────────── */}
            <div className="vd-info-mobile">
                {/* Title */}
                <div className="vd-info-mobile-title-wrap">
                    <div className="vd-info-mobile-title">
                        {vehicle.brand} {vehicle.model}
                    </div>
                    <span className="vd-info-mobile-year">{vehicle.year}</span>
                </div>

                {/* Chips row */}
                <div className="vd-info-mobile-chips">
                    {mileageFormatted}
                    {fuelDisplay !== "—" ? ` · ${fuelDisplay}` : ""}
                    {transmissionDisplay !== "—" ? ` · ${transmissionDisplay}` : ""}
                </div>

                {/* Price */}
                <div className="vd-info-mobile-price">{priceFormatted}</div>

                {/* Status badge (non-Disponible only) */}
                {vehicle.status && vehicle.status !== "Disponible" && (
                    <div style={{ marginBottom: 12 }}>
                        <StatusBadge status={vehicle.status} variant="inline" />
                    </div>
                )}
                {vehicle.isFeatured && (
                    <div style={{ marginBottom: 12 }}>
                        <FeaturedBadge variant="inline" />
                    </div>
                )}

                {/* CTA */}
                <button
                    className="vd-info-mobile-cta"
                    onClick={() => setShowAppointmentModal(true)}
                >
                    <CalendarCheck size={19} />
                    {vd.scheduleVisit}
                </button>

                <hr className="vd-info-mobile-separator" />

                {/* Specs */}
                {specRows.map(spec => (
                    <div key={spec.label} className="vd-info-mobile-spec-row">
                        <span className="vd-info-mobile-spec-label">{spec.label}</span>
                        <span className="vd-info-mobile-spec-value">{spec.value}</span>
                    </div>
                ))}

                {/* Color */}
                {colorDisplay && (
                    <div className="vd-info-mobile-spec-row">
                        <span className="vd-info-mobile-spec-label">Color</span>
                        <span className="vd-info-mobile-spec-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {vehicle.color && COLOR_MAP[vehicle.color] && (
                                <span style={{
                                    display: "inline-block",
                                    width: 14, height: 14,
                                    borderRadius: "50%",
                                    backgroundColor: COLOR_MAP[vehicle.color].hex,
                                    border: `1px solid ${COLOR_MAP[vehicle.color].border}`,
                                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)"
                                }} />
                            )}
                            {colorDisplay}
                        </span>
                    </div>
                )}

                {/* Type */}
                {vehicle.type && (
                    <div className="vd-info-mobile-spec-row">
                        <span className="vd-info-mobile-spec-label">{vd.type}</span>
                        <span className="vd-info-mobile-spec-value">{vehicle.type}</span>
                    </div>
                )}

                {/* Description */}
                {vehicle.description && (
                    <p className="vd-info-mobile-desc">{vehicle.description}</p>
                )}
            </div>

            {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
            <div className="vd-container">
                <div className="vd-grid">
                    {/* Left: Gallery (Desktop) */}
                    <div className="vd-gallery-desktop">
                        {/* Main image */}
                        <div style={{
                            width: "100%",
                            aspectRatio: "4/3",
                            position: "relative",
                            backgroundColor: "var(--clr-surface-a10)",
                            marginBottom: 16,
                            borderRadius: "16px",
                            overflow: "hidden"
                        }}>
                            <Image
                                src={images[activeImg]}
                                alt={vehicleTitle}
                                fill
                                style={{ objectFit: "cover" }}
                                priority
                                sizes="(max-width: 992px) 100vw, 60vw"
                                quality={100}
                                unoptimized
                            />
                            {/* Back arrow overlay */}
                            <Link
                                href="/autos"
                                aria-label={vd.backToCatalog}
                                style={{
                                    position: "absolute", top: 14, left: 14, zIndex: 10,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 38, height: 38, borderRadius: "50%",
                                    background: "rgba(255,255,255,0.88)",
                                    backdropFilter: "blur(6px)",
                                    boxShadow: "0 1px 8px rgba(0,0,0,0.15)",
                                    color: "#111", textDecoration: "none",
                                    transition: "background 0.15s",
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,1)")}
                                onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.88)")}
                            >
                                <ChevronLeft size={20} strokeWidth={2.5} />
                            </Link>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`vd-thumb ${i === activeImg ? 'active' : ''}`}
                                        style={{
                                            aspectRatio: "4/3",
                                            position: "relative",
                                            cursor: "pointer",
                                            background: "none",
                                            padding: 0,
                                            border: "none",
                                            borderRadius: "8px",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <Image src={img} alt="" fill style={{ objectFit: "cover" }} sizes="120px" quality={100} unoptimized />
                                        {i === activeImg && (
                                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Content (Desktop Sticky Column) */}
                    <div className="vd-info-desktop">
                        {!logoError && brandLogo && (
                            <div style={{ marginBottom: 20 }}>
                                <img
                                    src={`/carBrands/${brandLogo}`}
                                    alt={`${vehicle.brand} logo`}
                                    style={{ height: 48, width: "auto", objectFit: "contain", opacity: 0.9 }}
                                    onError={() => setLogoError(true)}
                                />
                            </div>
                        )}

                        <span className="vd-year">{vehicle.year}</span>
                        <h1 className="vd-title">{vehicleTitle}</h1>

                        <div className="vd-price">
                            {priceFormatted} <span> USD</span>
                        </div>

                        <div className="vd-badge-group">
                            {vehicle.status && (
                                <StatusBadge status={vehicle.status} variant="inline" />
                            )}
                            {vehicle.isFeatured && (
                                <FeaturedBadge variant="inline" />
                            )}
                            {vehicle.color && COLOR_MAP[vehicle.color] && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 14px",
                                    borderRadius: 40,
                                    border: "1px solid var(--clr-surface-a30)",
                                    background: "var(--clr-surface-a10)",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    textTransform: "uppercase"
                                }}>
                                    <div style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        backgroundColor: COLOR_MAP[vehicle.color].hex,
                                        border: `1px solid ${COLOR_MAP[vehicle.color].border}`,
                                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)"
                                    }} />
                                    {colorDisplay}
                                </div>
                            )}
                            {vehicle.type && <span className="vd-badge">{vehicle.type}</span>}
                            {vehicle.mileage === 0 && <span className="vd-badge" style={{ borderColor: "#10b981", color: "#10b981", background: "rgba(16,185,129,0.05)" }}>{vd.newBadge}</span>}
                        </div>

                        <div className="vd-specs">
                            {specRows.map((spec) => (
                                <div key={spec.label} className="vd-spec-row">
                                    <span className="vd-spec-label">{spec.label}</span>
                                    <span className="vd-spec-value">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        {vehicle.description && (
                            <div className="vd-desc">
                                {vehicle.description}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                            <button
                                onClick={() => setShowAppointmentModal(true)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    background: "var(--accent)", color: "#fff", border: "none",
                                    padding: "18px 32px", fontFamily: "'Outfit', sans-serif",
                                    fontSize: 15, fontWeight: 700, letterSpacing: "0.05em",
                                    textTransform: "uppercase", cursor: "pointer", width: "100%",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
                            >
                                <CalendarCheck size={18} />
                                {vd.scheduleVisit}
                            </button>
                        </div>

                        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.02em" }}>
                            {vd.dataPrivacy}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── APPOINTMENT MODAL ──────────────────────────────────────────── */}
            {showAppointmentModal && (
                <>
                <style>{`
                    .vd-apt-overlay {
                        position: fixed; inset: 0;
                        background: rgba(0,0,0,0.65);
                        backdrop-filter: blur(6px);
                        z-index: 9999;
                        display: flex;
                        align-items: flex-start;
                        justify-content: center;
                        padding: 40px 16px;
                        overflow-y: auto;
                    }
                    .vd-apt-inner {
                        background: var(--clr-surface-a10);
                        width: 100%;
                        max-width: 1000px;
                        position: relative;
                        border-radius: 16px;
                        box-shadow: 0 24px 64px rgba(0,0,0,0.5);
                    }
                    .vd-apt-close {
                        position: absolute; top: 16px; right: 20px;
                        background: none; border: none;
                        font-size: 22px; color: var(--text-muted);
                        cursor: pointer; z-index: 1;
                        line-height: 1;
                    }
                    @media (max-width: 768px) {
                        .vd-apt-overlay {
                            align-items: flex-end;
                            padding: 0;
                            overflow-y: hidden;
                        }
                        .vd-apt-inner {
                            border-radius: 20px 20px 0 0;
                            max-height: 92dvh;
                            overflow-y: auto;
                            box-shadow: 0 -8px 40px rgba(0,0,0,0.25);
                        }
                        .vd-apt-close { display: none; }
                    }
                `}</style>
                <div
                    className="vd-apt-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAppointmentModal(false); }}
                >
                    <div className="vd-apt-inner">
                        <button
                            className="vd-apt-close"
                            onClick={() => setShowAppointmentModal(false)}
                        >✕</button>
                        <AppointmentForm
                            referrerId={referrerId}
                            vehicleId={vehicle.id}
                            vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                            onSuccess={() => setShowAppointmentModal(false)}
                        />
                    </div>
                </div>
                </>
            )}

            {/* ── CONTACT MODAL ──────────────────────────────────────────────── */}
            {showContactModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}
                    style={{
                        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
                    }}
                >
                    <div style={{
                        background: "var(--clr-surface-a10)", width: "100%", maxWidth: 500, padding: 40, position: "relative",
                        fontFamily: "'Manrope', sans-serif", borderRadius: 16
                    }}>
                        <button
                            onClick={() => setShowContactModal(false)}
                            style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", fontSize: 24, color: "var(--text-muted)", cursor: "pointer" }}
                        >✕</button>
                        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 8, color: "var(--text-primary)" }}>
                            {vd.requestInfo}
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>
                            {vd.requestInfoDesc} <strong>{vehicleTitle}</strong>.
                        </p>
                        <ContactForm
                            vehicleSlug={vehicle.slug}
                            vehicleName={vehicleTitle}
                            onClose={() => setShowContactModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
