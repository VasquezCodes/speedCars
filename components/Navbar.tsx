'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Heart, User, Search, Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const [navSearch, setNavSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [locationHover, setLocationHover] = useState(false);
    const [hoursOpen, setHoursOpen] = useState(false);
    const [isOpenStatus, setIsOpenStatus] = useState(false);
    const [todayHours, setTodayHours] = useState("9 AM - 6 PM");

    // Dynamic hours calculation based on Texas Time (America/Chicago)
    useEffect(() => {
        const checkOpenStatus = () => {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Chicago',
                hour: 'numeric',
                hour12: false,
                weekday: 'short'
            });
            const parts = formatter.formatToParts(new Date());

            const hourStr = parts.find(p => p.type === 'hour')?.value;
            const currentHour = parseInt(hourStr || '0', 10);
            const weekday = parts.find(p => p.type === 'weekday')?.value; // 'Sun', 'Mon', etc.

            let open = false;
            let hoursText = "9 AM - 6 PM";

            if (weekday === 'Sun') {
                hoursText = "10 AM - 4 PM";
                if (currentHour >= 10 && currentHour < 16) open = true;
            } else {
                hoursText = "9 AM - 6 PM";
                if (currentHour >= 9 && currentHour < 18) open = true;
            }

            setIsOpenStatus(open);
            setTodayHours(hoursText);
        };

        checkOpenStatus();
        const intervalId = setInterval(checkOpenStatus, 60000); // Actualiza cada minuto
        return () => clearInterval(intervalId);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [menuOpen]);

    return (
        <header className="navbar-container" style={{
            background: "var(--white)"
        }}>
            {/* Top Row */}
            <div className="container" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                gap: "24px",
            }}>
                {/* Left side: Logo & Nav */}
                <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                        <Image
                            src="/logoLightMode.jpeg"
                            alt="FF Speed Cars Logo"
                            width={340}
                            height={100}
                            className="logo-img"
                            style={{ width: "auto", objectFit: "contain" }}
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                        <NavLink href="/autos">Catálogo</NavLink>
                        <NavLink href="/#nosotros">Nosotros</NavLink>
                        <NavLink href="/#testimonios">Testimonios</NavLink>
                        <NavLink href="/#faq">Preguntas</NavLink>
                        <NavLink href="/#contacto">Contacto</NavLink>
                    </nav>
                </div>

                {/* Right side: Actions & Mobile toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>

                    <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                        {/* Location */}
                        <div
                            className="location-wrapper"
                            style={{ position: "relative" }}
                            onMouseEnter={() => setLocationHover(true)}
                            onMouseLeave={() => setLocationHover(false)}
                        >
                            <div className="action-item" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", paddingBottom: "32px", marginBottom: "-32px" }}>
                                <MapPin size={24} className="action-icon" strokeWidth={1.5} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.1, fontWeight: 500 }}>Tu sucursal en</span>
                                    <span className="action-text" style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Fort Worth, TX</span>
                                </div>
                            </div>

                            {/* Dropdown menu */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 18px)",
                                    left: "50%",
                                    transform: "translateX(-50%) translateY(10px)",
                                    width: "310px",
                                    background: "var(--white)",
                                    borderRadius: "20px",
                                    boxShadow: "0 12px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                                    padding: "24px",
                                    zIndex: 100,
                                    opacity: locationHover ? 1 : 0,
                                    visibility: locationHover ? "visible" : "hidden",
                                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                                    ...(locationHover && { transform: "translateX(-50%) translateY(0)" })
                                }}
                            >
                                {/* Arrow on top */}
                                <div style={{
                                    position: "absolute",
                                    top: "-8px",
                                    left: "50%",
                                    transform: "translateX(-50%) rotate(45deg)",
                                    width: "16px",
                                    height: "16px",
                                    background: "var(--white)",
                                    borderRadius: "3px",
                                    boxShadow: "-4px -4px 10px rgba(0,0,0,0.02)"
                                }} />

                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Tu sucursal en 76119:</p>
                                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>Fort Worth</h3>

                                    <p style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "16px", lineHeight: 1.5 }}>
                                        5047 David Strickland Rd<br />
                                        Ste 137, Fort Worth, TX 76119
                                    </p>

                                    <div
                                        style={{
                                            marginBottom: "20px",
                                            border: hoursOpen ? "1px solid var(--accent)" : "1px solid transparent",
                                            borderRadius: "8px",
                                            padding: hoursOpen ? "10px" : "0",
                                            marginLeft: hoursOpen ? "-11px" : "0",
                                            marginRight: hoursOpen ? "-11px" : "0",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                                            <span style={{
                                                background: isOpenStatus ? "#E8F5E9" : "#FFEBEB",
                                                color: isOpenStatus ? "#1B5E20" : "#CC0000",
                                                padding: "4px 10px",
                                                borderRadius: "100px",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                letterSpacing: "-0.01em"
                                            }}>
                                                {isOpenStatus ? "Abierto ahora" : "Cerrado ahora"}
                                            </span>
                                            <div
                                                onClick={() => setHoursOpen(!hoursOpen)}
                                                style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-primary)", fontWeight: 500, cursor: "pointer", userSelect: "none" }}
                                            >
                                                {todayHours} <span style={{ transition: "transform 0.2s", transform: hoursOpen ? "rotate(180deg)" : "rotate(0deg)", display: "flex" }}><ChevronDown size={14} /></span>
                                            </div>
                                        </div>

                                        {hoursOpen && (
                                            <div style={{
                                                marginTop: "12px",
                                                paddingTop: "12px",
                                                borderTop: "1px solid var(--gray-200)",
                                                fontSize: "14px",
                                                color: "var(--text-primary)",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "8px",
                                                animation: "fadeInDown 0.2s ease forwards"
                                            }}>
                                                <div>Lun-Sáb: 9 AM - 6 PM</div>
                                                <div>Dom: 10 AM - 4 PM</div>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>
                        </div>

                        {/* IG */}
                        <div className="action-item" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src="/ig.svg" alt="Instagram" width={22} height={22} className="action-icon" />
                        </div>

                        {/* FB */}
                        <div className="action-item" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src="/fb.svg" alt="Facebook" width={22} height={22} className="action-icon" />
                        </div>
                    </div>

                    {/* Mobile-only location chip */}
                    <div className="mobile-location" style={{ display: "none", alignItems: "center", gap: "6px" }}>
                        <MapPin size={16} strokeWidth={1.5} color="var(--text-secondary)" />
                        <div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1, fontWeight: 500 }}>Tu sucursal</div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>Fort Worth</div>
                        </div>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        className="mobile-menu-btn"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Bottom Row: Search */}
            <div className="container search-container" style={{ padding: "0 24px 12px 24px" }}>
                <div className="search-wrapper" style={{ position: "relative", width: "100%" }}>
                    <input
                        type="text"
                        id="header-inventory-search"
                        placeholder="¿Qué tipo de auto estás buscando?"
                        className="search-input"
                        value={navSearch}
                        onChange={(e) => setNavSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const q = navSearch.trim();
                                router.push(q ? `/autos?search=${encodeURIComponent(q)}` : "/autos");
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const q = navSearch.trim();
                            router.push(q ? `/autos?search=${encodeURIComponent(q)}` : "/autos");
                        }}
                        style={{
                            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer", padding: 4,
                            display: "flex", alignItems: "center",
                        }}
                        aria-label="Buscar"
                    >
                        <Search size={22} color="#222" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Quick-access pills — mobile only */}
            <div className="quick-pills">
                <QuickPill href="/autos">Catálogo</QuickPill>
                <QuickPill href="/#nosotros">Nosotros</QuickPill>
                <QuickPill href="/#contacto">Contacto</QuickPill>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="mobile-menu" style={{
                    position: "absolute", top: "100%", left: 0, width: "100%",
                    background: "var(--white)",
                    borderTop: "1px solid var(--gray-200)",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    height: "100vh",
                    overflowY: "auto",
                    paddingBottom: "100px"
                }}>
                    <MobileNavLink href="/autos" onClick={() => setMenuOpen(false)}>Catálogo</MobileNavLink>
                    <MobileNavLink href="/#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</MobileNavLink>
                    <MobileNavLink href="/#testimonios" onClick={() => setMenuOpen(false)}>Testimonios</MobileNavLink>
                    <MobileNavLink href="/#faq" onClick={() => setMenuOpen(false)}>Preguntas Frecuentes</MobileNavLink>
                    <MobileNavLink href="/#contacto" onClick={() => setMenuOpen(false)}>Contacto</MobileNavLink>

                    <div style={{ padding: "24px", display: "flex", gap: "24px", borderTop: "1px solid var(--gray-200)", marginTop: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-primary)" }}>
                            <MapPin size={24} strokeWidth={1.5} />
                            <span style={{ fontSize: "15px", fontWeight: 600 }}>Fort Worth</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-primary)", marginLeft: "auto" }}>
                            <Image src="/ig.svg" alt="Instagram" width={24} height={24} />
                            <Image src="/fb.svg" alt="Facebook" width={24} height={24} />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .nav-link {
            color: var(--text-secondary);
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 8px 0;
            transition: all 0.2s;
            position: relative;
        }
        .nav-link:hover {
            color: var(--text-primary);
        }
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--accent);
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s ease;
        }
        .nav-link:hover::after {
            transform: scaleX(1);
            transform-origin: left;
        }

        .action-item {
            transition: opacity 0.2s;
        }
        .action-item:hover .action-icon {
            color: var(--accent);
        }
        .action-item:hover .action-text {
            color: var(--accent) !important;
        }
        .action-icon {
            color: var(--text-secondary);
            transition: color 0.2s;
        }
        .action-text {
            transition: color 0.2s;
        }

        .search-input {
            width: 100%;
            height: 44px;
            border-radius: 100px;
            border: 2px solid var(--gray-200);
            padding: 0 54px 0 24px;
            font-size: 16px;
            color: var(--text-primary);
            background: var(--gray-50);
            outline: none;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        .search-input:hover {
            border-color: var(--gray-300);
            background: var(--white);
        }
        .search-input:focus {
            background: var(--white);
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(209, 17, 25, 0.1);
        }
        .search-input::placeholder {
            color: var(--gray-400);
            font-weight: 400;
        }

        .logo-img {
            height: 96px;
            margin: -12px 0;
        }

        .navbar-container {
            position: relative;
            z-index: 50;
        }
        .navbar-container .container {
            max-width: 1504px;
        }

        .quick-pills {
            display: none;
            gap: 8px;
            padding: 0 16px 12px;
        }

        .quick-pill {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 9px 0;
            border-radius: 100px;
            border: 1.5px solid var(--gray-200);
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
            text-decoration: none;
            background: var(--white);
            text-align: center;
            transition: background 0.2s, border-color 0.2s;
        }
        .quick-pill:hover {
            background: var(--gray-50);
            border-color: var(--gray-300);
        }

        @media (max-width: 1024px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
            .mobile-location { display: flex !important; }
            .quick-pills { display: flex !important; }
            .logo-img { height: 52px !important; margin: 0 !important; }
        }
        @media (min-width: 1025px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-location { display: none !important; }
        }
      `}</style>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="nav-link">
            {children}
        </Link>
    );
}

function QuickPill({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="quick-pill">
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} style={{
            color: "var(--text-primary)",
            padding: "20px 24px",
            borderBottom: "1px solid var(--gray-200)",
            fontWeight: 600,
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "background 0.2s"
        }}
            onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.background = 'var(--gray-50)'}
            onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.background = 'transparent'}
        >
            {children}
            <ChevronDown size={20} style={{ transform: "rotate(-90deg)", opacity: 0.4 }} />
        </Link>
    );
}
