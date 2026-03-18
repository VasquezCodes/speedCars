'use client';

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function NosotrosSection() {
    const { t } = useLanguage();
    const { nosotros } = t;

    const cards = [nosotros.card1, nosotros.card2, nosotros.card3];

    return (
        <section id="nosotros" style={{ padding: "80px 0", background: "var(--clr-dark-a0)", borderTop: "1px solid var(--clr-surface-a20)" }}>
            <div className="container">
                <div className="nosotros-grid">

                    {/* Text */}
                    <div>
                        <h2 style={{
                            fontFamily: "var(--font-rb-rational), sans-serif",
                            fontSize: "clamp(40px, 5vw, 72px)",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            lineHeight: 0.92,
                            letterSpacing: "-0.02em",
                            textTransform: "uppercase",
                            marginBottom: "24px",
                            marginLeft: "-3px"
                        }}>
                            {nosotros.titleLine1}<br />
                            {nosotros.titleLine2}{nosotros.titleLine3 && <><br />{nosotros.titleLine3}</>}
                            <span style={{ color: "var(--accent)" }}>.</span>
                        </h2>
                        <div style={{ width: 36, height: 3, background: "var(--accent)", marginBottom: 28 }} />
                        <p style={{
                            color: "var(--text-muted)",
                            fontSize: "16px",
                            lineHeight: 1.7,
                            maxWidth: "460px"
                        }}>
                            {nosotros.description}
                        </p>
                    </div>

                    {/* Image */}
                    <div className="nosotros-img-wrap" style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "4/3",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}>
                        <Image
                            src="/history.png"
                            alt="FF Speed Cars - Fort Worth, TX"
                            fill
                            style={{ objectFit: "cover", objectPosition: "center" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                </div>

                {/* Cards */}
                <div style={{ marginTop: "80px", borderTop: "1px solid var(--clr-surface-a20)", paddingTop: "64px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "40px" }}>
                    {nosotros.cardsTitle}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
                    {cards.map((item, index) => (
                        <div key={index} style={{ paddingRight: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "8px", height: "8px", background: "var(--accent)", flexShrink: 0 }} />
                                {item.title}
                            </h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6 }}>
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
                </div>

            </div>
        </section>
    );
}
