"use client";

import { Mail, MapPin, Clock } from "lucide-react";
import { sileo } from "sileo";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactSection() {
  const { t } = useLanguage();
  const email = "ffspeedcarsllc@gmail.com";

  return (
    <section
      id="contacto"
      style={{
        padding: "80px 0",
        background: "var(--white)",
        borderTop: "1px solid var(--gray-200)"
      }}
    >
      <div className="container">

        {/* Section title */}
        <div style={{ marginBottom: "64px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-rb-rational), sans-serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}>
            {t.contact.title1} <span style={{ color: "var(--accent)" }}>{t.contact.title2.replace('\n', '\n')}</span>
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "16px",
            lineHeight: 1.6,
            maxWidth: "500px",
            margin: "0 auto",
            fontFamily: "var(--font-lato), sans-serif"
          }}>
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact card */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          maxWidth: "400px",
          margin: "0 auto"
        }}>
          <div
            onClick={() => {
              if (navigator?.clipboard) {
                navigator.clipboard.writeText(email);
                sileo.success({
                  title: t.contact.copied,
                  description: t.contact.copiedDesc,
                  duration: 3500
                });
              }
            }}
            style={{
              cursor: "pointer",
              padding: "40px",
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--gray-200)";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,51,51,0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)"
            }}>
              <Mail size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-rb-rational), sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px"
              }}>
                {t.contact.emailLabel}
              </h3>
              <p style={{
                color: "var(--text-muted)",
                fontSize: "16px",
                fontFamily: "var(--font-lato), sans-serif"
              }}>
                {t.contact.emailDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Extra info */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          marginTop: "48px",
          flexWrap: "wrap",
          padding: "0 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "14px", letterSpacing: "0.02em" }}>
            <MapPin size={16} strokeWidth={2.5} /> 5047 David Strickland Rd, Ste 137, Fort Worth, TX
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "14px", letterSpacing: "0.02em" }}>
            <Clock size={16} strokeWidth={2.5} /> {t.contact.weekdayHours} | {t.contact.sundayHours}
          </div>
        </div>

      </div>
    </section>
  );
}
