import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || "5491112345678";

    return (
        <footer style={{ background: "var(--primary)", color: "rgba(255,255,255,0.7)", marginTop: "auto" }}>
            <div className="container" style={{ padding: "48px 24px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40, marginBottom: 40 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <Image
                                src="/logo-nuevo.png"
                                alt="Speed Cars Logo"
                                width={180}
                                height={60}
                                style={{ height: "48px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
                            />
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
                            Tu concesionaria de confianza. Los mejores vehículos con la mejor atención.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: "white", fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Navegación</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <FooterLink href="/">Inicio</FooterLink>
                            <FooterLink href="/autos">Catálogo de Autos</FooterLink>
                            <FooterLink href="/#contacto">Contacto</FooterLink>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: "white", fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Contacto</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                            <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"
                                style={{ color: "#25D366", display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                                💬 WhatsApp
                            </a>
                            <span>📍 Tu Ciudad, Argentina</span>
                            <span>⏰ Lun–Sáb: 9 a 18hs</span>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: 13 }}>© {new Date().getFullYear()} AutosDealer. Todos los derechos reservados.</p>
                    <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Admin</Link>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, transition: "color 0.15s" }}>
            {children}
        </Link>
    );
}
