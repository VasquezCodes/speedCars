"use client";

import { useState } from "react";
import { MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { sileo } from "sileo";
import { useLanguage } from "@/context/LanguageContext";

const ADDRESS = "5047 David Strickland Rd, Fort Worth, TX 76119";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed&z=15`;

export default function ContactSection() {
  const { t } = useLanguage();
  const c = t.contact;

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("error");
      setSent(true);
      sileo.success({ title: c.successTitle, description: c.successDesc, duration: 5000 });
    } catch {
      sileo.error({ title: c.errorTitle, description: c.errorDesc });
    } finally {
      setSending(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.04)",
    border: `1.5px solid ${focused === name ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontFamily: "var(--font-lato), sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused === name ? "0 0 0 3px rgba(209,17,25,0.12)" : "none",
    boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: "8px",
    fontFamily: "var(--font-lato), sans-serif",
  };

  return (
    <section
      id="contacto"
      style={{
        padding: "100px 0",
        background: "var(--clr-dark-a0)",
        borderTop: "1px solid var(--clr-surface-a20)",
      }}
    >
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        .contact-fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 560px) {
          .contact-fields-row { grid-template-columns: 1fr; }
        }
        .contact-map-wrap {
          border-radius: 20px;
          overflow: hidden;
          height: 520px;
          position: relative;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }
        @media (max-width: 900px) {
          .contact-map-wrap { height: 380px; }
        }
        .contact-map-wrap iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }
        .contact-map-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          background: rgba(10,10,10,0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .contact-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 17px 24px;
          background: #d11119;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          font-family: var(--font-rb-rational), sans-serif;
        }
        .contact-submit-btn:hover:not(:disabled) {
          background: #b50e15;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(209,17,25,0.35);
        }
        .contact-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .contact-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .contact-meta-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        @keyframes contact-success-in {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <h2 style={{
            fontFamily: "var(--font-rb-rational), sans-serif",
            fontSize: "clamp(42px, 6vw, 68px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            {t.contact.title1}{" "}
            <span style={{ color: "var(--accent)" }}>
              {t.contact.title2.replace("\n", " ")}
            </span>
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "16px",
            lineHeight: 1.6,
            maxWidth: "480px",
            marginTop: "16px",
            fontFamily: "var(--font-lato), sans-serif",
          }}>
            {c.subtitle}
          </p>
        </div>

        <div className="contact-grid">
          {/* ── LEFT: Form ── */}
          <div>
            {sent ? (
              /* Success state */
              <div style={{
                animation: "contact-success-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
                textAlign: "center",
                padding: "60px 24px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(22,163,74,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <CheckCircle2 size={32} color="#16a34a" strokeWidth={2} />
                </div>
                <h3 style={{
                  fontFamily: "var(--font-rb-rational), sans-serif",
                  fontSize: "28px", fontWeight: 700, textTransform: "uppercase",
                  color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "-0.01em",
                }}>
                  {c.successTitle}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
                  {c.successDesc}
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                  style={{
                    padding: "12px 28px", background: "transparent",
                    border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "10px",
                    color: "var(--text-muted)", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "var(--font-lato), sans-serif",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {c.successCta}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>{c.fieldName}</label>
                  <input
                    type="text" required value={form.name} onChange={set("name")}
                    placeholder={c.namePlaceholder}
                    style={inputStyle("name")}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                  />
                </div>

                {/* Email + Phone */}
                <div className="contact-fields-row">
                  <div>
                    <label style={labelStyle}>{c.fieldEmail}</label>
                    <input
                      type="email" required value={form.email} onChange={set("email")}
                      placeholder={c.emailPlaceholder}
                      style={inputStyle("email")}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{c.fieldPhone}</label>
                    <input
                      type="tel" value={form.phone} onChange={set("phone")}
                      placeholder={c.phonePlaceholder}
                      style={inputStyle("phone")}
                      onFocus={() => setFocused("phone")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>{c.fieldMessage}</label>
                  <textarea
                    required rows={5} value={form.message} onChange={set("message")}
                    placeholder={c.messagePlaceholder}
                    style={{ ...inputStyle("message"), resize: "vertical", minHeight: "130px" }}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                  />
                </div>

                {/* Submit */}
                <button type="submit" disabled={sending} className="contact-submit-btn">
                  {sending ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M21 12a9 9 0 11-6.22-8.56"/>
                      </svg>
                      {c.sending}
                    </>
                  ) : (
                    <>
                      <Send size={15} strokeWidth={2.5} />
                      {c.send}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Meta info */}
            <div className="contact-meta-row">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--text-muted)", fontSize: "13px" }}>
                <MapPin size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{c.address}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "13px" }}>
                <Clock size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>{c.weekdayHours} &nbsp;·&nbsp; {c.sundayHours}</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Map ── */}
          <div className="contact-map-wrap">
            <iframe
              src={MAP_SRC}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="FF Speed Cars location"
            />

            {/* Floating address badge */}
            <div className="contact-map-badge">
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "rgba(209,17,25,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MapPin size={17} color="var(--accent)" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", fontFamily: "var(--font-lato), sans-serif" }}>
                  FF Speed Cars
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-lato), sans-serif" }}>
                  5047 David Strickland Rd, Ste 137
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
