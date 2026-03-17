'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrendingHeader() {
    const { t } = useLanguage();

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", alignItems: "end", marginBottom: "80px" }}>
            <div>
                <h2 style={{
                    fontFamily: "var(--font-rb-rational), sans-serif",
                    fontSize: "clamp(60px, 9vw, 120px)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 0.85,
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                    margin: "0 0 16px 0",
                    marginLeft: "-4px"
                }}>
                    {t.trending.line1}<br />{t.trending.line2}<span style={{ color: "var(--accent)" }}>.</span>
                </h2>
            </div>

            <div style={{ paddingBottom: "12px", maxWidth: "400px" }}>
                <p style={{
                    fontFamily: "var(--font-lato), sans-serif",
                    color: "var(--text-muted)",
                    fontSize: "17px",
                    lineHeight: 1.6,
                    marginBottom: "32px",
                    fontWeight: 400
                }}>
                    {t.trending.description}
                </p>

                <Link href="/autos" style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "var(--text-primary)",
                    fontWeight: 800,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    textDecoration: "none",
                    borderBottom: "2px solid var(--text-primary)",
                    paddingBottom: "6px",
                    transition: "color 0.3s ease, border-color 0.3s ease"
                }}
                    className="minimal-link-hover"
                >
                    {t.trending.explore} <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
            </div>
        </div>
    );
}
