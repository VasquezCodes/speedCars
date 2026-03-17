"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      background: "var(--white)",
      borderTop: "1px solid var(--gray-200)",
      padding: "32px 0 16px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "40px",
          marginBottom: "24px"
        }}>
          {/* Marca y Descripcion */}
          <div style={{ maxWidth: "320px" }}>
            <Link href="/" style={{ display: "inline-block", marginBottom: "12px", textDecoration: "none" }}>
              <Image
                src="/logo-nuevo.png"
                alt="FF Speed Cars Logo"
                width={150}
                height={48}
                style={{ height: "40px", width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              lineHeight: 1.6,
              fontFamily: "var(--font-lato), sans-serif",
              marginBottom: "16px"
            }}>
              {t.footer.description}
            </p>
          </div>

          {/* Navegación Derecha */}
          <div style={{ display: "flex", gap: "60px" }}>
            <div>
              <h4 style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-rb-rational), sans-serif",
                fontWeight: 700,
                marginBottom: "16px",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase"
              }}>
                {t.footer.navigation}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <FooterLink href="/">{t.footer.home}</FooterLink>
                <FooterLink href="/autos">{t.footer.inventory}</FooterLink>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid var(--gray-200)",
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <p style={{
            fontSize: "12px",
            color: "var(--gray-300)",
            letterSpacing: "0.05em",
            fontFamily: "var(--font-rb-rational)"
          }}>
            © {new Date().getFullYear()} FF SPEED CARS. {t.footer.rights}
          </p>
          <div style={{
            display: "flex",
            gap: "24px",
            fontSize: "12px",
            color: "var(--gray-300)",
            letterSpacing: "0.05em"
          }}>
            <span>FORT WORTH, TEXAS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--text-muted)",
        fontSize: "14px",
        textDecoration: "none",
        transition: "color 0.2s ease, transform 0.2s ease",
        display: "inline-block"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      {children}
    </Link>
  );
}
