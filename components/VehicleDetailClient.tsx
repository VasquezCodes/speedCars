'use client';

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { CalendarCheck, ChevronLeft, ChevronRight, CheckCircle2, Maximize2, X } from 'lucide-react';
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
    return map[normalize] || null;
};

const FUEL_ES: Record<string, string> = {
    'Nafta': 'Gasolina',
};
const FUEL_EN: Record<string, string> = {
    'Nafta': 'Gasoline', 'Gasolina': 'Gasoline',
    'Diesel': 'Diesel', 'Diésel': 'Diesel',
    'Híbrido': 'Hybrid', 'Eléctrico': 'Electric',
    'GNC': 'CNG', 'GLP': 'LPG',
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
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const touchStartX = useRef(0);
    const slideRef = useRef<HTMLDivElement>(null);
    const thumbStripRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const code = getCookie("referral");
        if (code) setReferrerId(code);
    }, []);

    useEffect(() => {
        setLogoError(false);
        setActiveImg(0);
        if (slideRef.current) {
            slideRef.current.style.transition = "none";
            slideRef.current.style.transform = "translateX(0%)";
        }
    }, [vehicle.slug]);

    const validImages = (vehicle.images ?? []).filter(url => url && !url.includes("res.cloudinary.com"));
    const images = validImages.length ? validImages : ["/placeholder-car.svg"];

    useEffect(() => {
        if (!showLightbox) return;
        document.body.style.overflow = "hidden";
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowLightbox(false);
            if (e.key === "ArrowRight") setLightboxIdx(i => (i + 1) % images.length);
            if (e.key === "ArrowLeft") setLightboxIdx(i => (i - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", handler);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handler);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLightbox, images.length]);

    const brandLogo = getBrandLogo(vehicle.brand);
    // Auto-scroll thumbstrip to keep active thumb visible
    useEffect(() => {
        const strip = thumbStripRef.current;
        if (!strip) return;
        const thumb = strip.children[activeImg] as HTMLElement;
        if (!thumb) return;
        const stripRect = strip.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        if (thumbRect.left < stripRect.left + 40) {
            strip.scrollBy({ left: thumbRect.left - stripRect.left - 40, behavior: "smooth" });
        } else if (thumbRect.right > stripRect.right - 40) {
            strip.scrollBy({ left: thumbRect.right - stripRect.right + 40, behavior: "smooth" });
        }
    }, [activeImg]);


    const vehicleTitle = `${vehicle.brand} ${vehicle.model}`;
    const priceFormatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(vehicle.price);
    const mileageFormatted = vehicle.mileage === 0
        ? vd.mileageNew
        : `${vehicle.mileage.toLocaleString("en-US")} mi`;

    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
        if (slideRef.current) slideRef.current.style.transition = "none";
    }

    function handleTouchMove(e: React.TouchEvent) {
        if (!slideRef.current) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        const clamped = (activeImg === 0 && delta > 0) || (activeImg === images.length - 1 && delta < 0)
            ? delta * 0.2
            : delta;
        slideRef.current.style.transform = `translateX(calc(${-activeImg * 100}% + ${clamped}px))`;
    }

    function handleTouchEnd(e: React.TouchEvent) {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        const newIdx = Math.abs(delta) > 40
            ? delta > 0
                ? Math.min(activeImg + 1, images.length - 1)
                : Math.max(activeImg - 1, 0)
            : activeImg;
        if (slideRef.current) {
            slideRef.current.style.transition = "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            slideRef.current.style.transform = `translateX(${-newIdx * 100}%)`;
        }
        setActiveImg(newIdx);
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

    function scrollThumbStrip(dir: "left" | "right") {
        thumbStripRef.current?.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
    }

    const fuelDisplay = vehicle.fuelType
        ? (lang === 'en' ? (FUEL_EN[vehicle.fuelType] ?? vehicle.fuelType) : (FUEL_ES[vehicle.fuelType] ?? vehicle.fuelType))
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
                .vd-grid > * {
                    min-width: 0;
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
                .vd-gallery-mobile-img::-webkit-scrollbar {
                    display: none;
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

                /* ── Thumbstrip ─────────────────────────────────── */
                .vd-thumbstrip-wrap {
                    position: relative;
                    margin-top: 14px;
                }
                .vd-thumbstrip-wrap::before,
                .vd-thumbstrip-wrap::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 8px;
                    width: 48px;
                    z-index: 2;
                    pointer-events: none;
                }
                .vd-thumbstrip-wrap::before {
                    left: 0;
                    background: linear-gradient(to right, var(--primary), transparent);
                }
                .vd-thumbstrip-wrap::after {
                    right: 0;
                    background: linear-gradient(to left, var(--primary), transparent);
                }
                .vd-thumbstrip-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-65%);
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(18,18,18,0.9);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 3;
                    opacity: 0;
                    transition: opacity 0.18s, background 0.18s, transform 0.18s;
                    backdrop-filter: blur(6px);
                    padding: 0;
                }
                .vd-thumbstrip-arrow-left { left: 2px; }
                .vd-thumbstrip-arrow-right { right: 2px; }
                .vd-thumbstrip-wrap:hover .vd-thumbstrip-arrow { opacity: 1; }
                .vd-thumbstrip-arrow:hover {
                    background: rgba(40,40,40,0.98);
                    transform: translateY(-65%) scale(1.12);
                }
                .vd-thumbstrip {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    overflow-y: hidden;
                    scrollbar-width: none;
                    padding: 4px 2px 10px;
                    scroll-behavior: smooth;
                }
                .vd-thumbstrip::-webkit-scrollbar { display: none; }
                .vd-thumbstrip-item {
                    flex-shrink: 0;
                    width: 92px;
                    height: 69px;
                    position: relative;
                    border-radius: 7px;
                    overflow: hidden;
                    border: 2px solid transparent;
                    opacity: 0.45;
                    cursor: pointer;
                    background: none;
                    padding: 0;
                    transition: opacity 0.15s, border-color 0.15s;
                    outline: none;
                }
                .vd-thumbstrip-item:hover {
                    opacity: 0.85;
                }
                .vd-thumbstrip-item.active {
                    opacity: 1;
                    border-color: var(--accent, #d11119);
                }
                .vd-thumbstrip-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
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

                /* ── Lightbox ───────────────────────────────────── */
                @keyframes vd-lb-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes vd-lb-img-in {
                    from { opacity: 0; transform: scale(0.96); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .vd-lb-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.96);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: vd-lb-in 0.2s ease;
                }
                .vd-lb-img-wrap {
                    position: relative;
                    max-width: min(92vw, 1400px);
                    max-height: 88vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: vd-lb-img-in 0.25s cubic-bezier(0.16,1,0.3,1);
                }
                .vd-lb-img-wrap img {
                    max-width: min(92vw, 1400px);
                    max-height: 88vh;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    display: block;
                    user-select: none;
                    -webkit-user-drag: none;
                }
                .vd-lb-close {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, transform 0.15s;
                    z-index: 1;
                    backdrop-filter: blur(8px);
                }
                .vd-lb-close:hover {
                    background: rgba(255,255,255,0.2);
                    transform: scale(1.08);
                }
                .vd-lb-arrow {
                    position: fixed;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, transform 0.15s;
                    z-index: 1;
                    backdrop-filter: blur(8px);
                }
                .vd-lb-arrow:hover {
                    background: rgba(255,255,255,0.18);
                    transform: translateY(-50%) scale(1.06);
                }
                .vd-lb-arrow-left  { left: 20px; }
                .vd-lb-arrow-right { right: 20px; }
                .vd-lb-counter {
                    position: fixed;
                    bottom: 28px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    color: rgba(255,255,255,0.45);
                }
                .vd-lb-thumbs {
                    position: fixed;
                    bottom: 52px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    max-width: 90vw;
                    overflow-x: auto;
                    padding: 4px;
                    scrollbar-width: none;
                }
                .vd-lb-thumbs::-webkit-scrollbar { display: none; }
                .vd-lb-thumb {
                    flex-shrink: 0;
                    width: 52px;
                    height: 38px;
                    border-radius: 5px;
                    overflow: hidden;
                    opacity: 0.4;
                    border: 1.5px solid transparent;
                    cursor: pointer;
                    transition: opacity 0.2s, border-color 0.2s, transform 0.15s;
                    background: none;
                    padding: 0;
                    position: relative;
                }
                .vd-lb-thumb:hover { opacity: 0.7; transform: scale(1.05); }
                .vd-lb-thumb.active {
                    opacity: 1;
                    border-color: var(--accent, #d11119);
                }
                .vd-lb-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                /* Expand button on desktop main image */
                .vd-expand-btn {
                    position: absolute;
                    bottom: 14px;
                    right: 14px;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s, background 0.2s;
                    z-index: 5;
                    backdrop-filter: blur(4px);
                }
                .vd-gallery-desktop:hover .vd-expand-btn {
                    opacity: 1;
                }
                .vd-expand-btn:hover {
                    background: rgba(0,0,0,0.75);
                }
                /* Expand button on mobile */
                .vd-expand-btn-mobile {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    width: 32px;
                    height: 32px;
                    border-radius: 7px;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                }
                `}} />

            {/* ── MOBILE GALLERY ─────────────────────────────────────────────── */}
            <div className="vd-gallery-mobile">
                {/* Scroll-snap image strip */}
                <div style={{ position: "relative" }}>
                    <div
                        className="vd-gallery-mobile-img"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ overflow: "hidden", touchAction: "pan-y", position: "relative" }}
                    >
                        <div
                            ref={slideRef}
                            style={{
                                display: "flex",
                                transform: `translateX(${-activeImg * 100}%)`,
                                transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                willChange: "transform",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            {images.map((src, i) => (
                                <div key={src + i} style={{
                                    flexShrink: 0, width: "100%", height: "100%",
                                    position: "relative",
                                }}>
                                    <Image
                                        src={src}
                                        alt={vehicleTitle}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        priority={i === 0}
                                        sizes="100vw"
                                        quality={100}
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
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

                    {/* Mobile expand button */}
                    <button
                        className="vd-expand-btn-mobile"
                        onClick={() => { setLightboxIdx(activeImg); setShowLightbox(true); }}
                        aria-label="Ver imagen ampliada"
                    >
                        <Maximize2 size={13} strokeWidth={2} />
                    </button>
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
                {(lang === 'en' ? (vehicle.descriptionEn || vehicle.description) : vehicle.description) && (
                    <p className="vd-info-mobile-desc">
                        {lang === 'en' ? (vehicle.descriptionEn || vehicle.description) : vehicle.description}
                    </p>
                )}
            </div>

            {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
            <div className="vd-container">
                <div className="vd-grid">
                    {/* Left: Gallery (Desktop) */}
                    <div className="vd-gallery-desktop">
                        {/* Main image */}
                        <div
                            style={{
                                width: "100%",
                                aspectRatio: "4/3",
                                position: "relative",
                                backgroundColor: "var(--clr-surface-a10)",
                                marginBottom: 16,
                                borderRadius: "16px",
                                overflow: "hidden",
                                cursor: "zoom-in",
                            }}
                            onClick={() => { setLightboxIdx(activeImg); setShowLightbox(true); }}
                        >
                            {/* Filmstrip – no remount on slide change */}
                            <div style={{
                                display: "flex",
                                height: "100%",
                                transform: `translateX(${-activeImg * 100}%)`,
                                transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                willChange: "transform",
                            }}>
                                {images.map((src, i) => (
                                    <div key={i} style={{ flexShrink: 0, width: "100%", height: "100%", position: "relative" }}>
                                        <Image
                                            src={src}
                                            alt={i === 0 ? vehicleTitle : ""}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            priority={i === 0}
                                            sizes="(max-width: 992px) 100vw, 60vw"
                                            quality={85}
                                            unoptimized
                                            loading={i < 3 ? "eager" : "lazy"}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Expand icon */}
                            <button
                                className="vd-expand-btn"
                                onClick={(e) => { e.stopPropagation(); setLightboxIdx(activeImg); setShowLightbox(true); }}
                                aria-label="Ver imagen ampliada"
                            >
                                <Maximize2 size={15} strokeWidth={2} />
                            </button>
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

                        {/* Filmstrip thumbnails */}
                        {images.length > 1 && (
                            <div className="vd-thumbstrip-wrap">
                                <button
                                    className="vd-thumbstrip-arrow vd-thumbstrip-arrow-left"
                                    onClick={() => scrollThumbStrip("left")}
                                    aria-label="Desplazar miniaturas a la izquierda"
                                >
                                    <ChevronLeft size={13} strokeWidth={2.5} />
                                </button>
                                <div
                                    className="vd-thumbstrip"
                                    ref={thumbStripRef}
                                >
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`vd-thumbstrip-item${i === activeImg ? ' active' : ''}`}
                                            aria-label={`Imagen ${i + 1}`}
                                            draggable={false}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="" draggable={false} loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="vd-thumbstrip-arrow vd-thumbstrip-arrow-right"
                                    onClick={() => scrollThumbStrip("right")}
                                    aria-label="Desplazar miniaturas a la derecha"
                                >
                                    <ChevronRight size={13} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Content (Desktop Sticky Column) */}
                    <div className="vd-info-desktop">
                        {!logoError && brandLogo && (
                            <div style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.93)", borderRadius: 8, padding: "6px 14px" }}>
                                <img
                                    src={`/carBrands/${brandLogo}`}
                                    alt={`${vehicle.brand} logo`}
                                    style={{ height: 36, width: "auto", objectFit: "contain" }}
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

                        {(lang === 'en' ? (vehicle.descriptionEn || vehicle.description) : vehicle.description) && (
                            <div className="vd-desc">
                                {lang === 'en' ? (vehicle.descriptionEn || vehicle.description) : vehicle.description}
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

            {/* ── LIGHTBOX ───────────────────────────────────────────────────── */}
            {showLightbox && (
                <div
                    className="vd-lb-overlay"
                    onClick={() => setShowLightbox(false)}
                >
                    {/* Close */}
                    <button
                        className="vd-lb-close"
                        onClick={() => setShowLightbox(false)}
                        aria-label="Cerrar"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>

                    {/* Prev */}
                    {images.length > 1 && (
                        <button
                            className="vd-lb-arrow vd-lb-arrow-left"
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + images.length) % images.length); }}
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft size={22} strokeWidth={2} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="vd-lb-img-wrap"
                        onClick={(e) => e.stopPropagation()}
                        key={lightboxIdx}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images[lightboxIdx]}
                            alt={`${vehicleTitle} — imagen ${lightboxIdx + 1}`}
                            draggable={false}
                        />
                    </div>

                    {/* Next */}
                    {images.length > 1 && (
                        <button
                            className="vd-lb-arrow vd-lb-arrow-right"
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % images.length); }}
                            aria-label="Siguiente imagen"
                        >
                            <ChevronRight size={22} strokeWidth={2} />
                        </button>
                    )}

                    {/* Thumbnails strip */}
                    {images.length > 1 && (
                        <div className="vd-lb-thumbs" onClick={(e) => e.stopPropagation()}>
                            {images.map((src, i) => (
                                <button
                                    key={i}
                                    className={`vd-lb-thumb${i === lightboxIdx ? " active" : ""}`}
                                    onClick={() => setLightboxIdx(i)}
                                    aria-label={`Ir a imagen ${i + 1}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Counter */}
                    <div className="vd-lb-counter" onClick={(e) => e.stopPropagation()}>
                        {lightboxIdx + 1} / {images.length}
                    </div>
                </div>
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
