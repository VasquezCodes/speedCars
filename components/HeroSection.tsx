'use client';

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const VIDEOS = ["/hero9.mp4", "/hero3.mp4", "/hero7.mp4", "/hero6.mp4"];
const FADE_MS = 900;

export default function HeroSection() {
    const { t } = useLanguage();
    const [activeIdx, setActiveIdx] = useState(0);
    const activeIdxRef = useRef(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);

    // Stable ref callbacks — created once, never recreated on re-render.
    const videoRefCallbacks = useRef(
        VIDEOS.map((_, index) => (el: HTMLVideoElement | null) => {
            if (el) {
                el.muted = true;
                el.setAttribute("muted", "");
            }
            videoRefs.current[index] = el;
        })
    ).current;

    useEffect(() => {
        const v = videoRefs.current[0];
        if (!v) return;
        v.muted = true;
        v.play().catch(() => {});
    }, []);

    const handleEnded = useCallback(() => {
        const current = activeIdxRef.current;
        const next = (current + 1) % VIDEOS.length;
        const nextVideo = videoRefs.current[next];
        if (nextVideo) {
            // Ensure it's loaded before playing (iOS needs preload set)
            nextVideo.preload = "auto";
            nextVideo.currentTime = 0;
            nextVideo.muted = true;
            nextVideo.play().catch(() => {});
        }
        // Preload the one after next
        const afterNext = (next + 1) % VIDEOS.length;
        const afterNextVideo = videoRefs.current[afterNext];
        if (afterNextVideo) afterNextVideo.preload = "auto";

        activeIdxRef.current = next;
        setActiveIdx(next);
    }, []);

    return (
        <section className="hero-fs">
            {/* Background videos */}
            {VIDEOS.map((src, index) => (
                <video
                    key={src}
                    ref={videoRefCallbacks[index]}
                    src={src}
                    playsInline
                    autoPlay={index === 0}
                    muted
                    preload={index === 0 ? "auto" : "none"}
                    onEnded={handleEnded}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center center",
                        opacity: index === activeIdx ? 1 : 0,
                        transition: `opacity ${FADE_MS}ms ease-in-out`,
                        zIndex: index === activeIdx ? 0 : -1,
                    }}
                />
            ))}

            {/* Cinematic overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background: [
                    "linear-gradient(to bottom, #121010 0%, rgba(18,16,16,0.45) 12%, rgba(18,16,16,0.05) 28%, rgba(18,16,16,0.3) 58%, rgba(18,16,16,0.85) 82%, #121010 100%)",
                    "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, transparent 75%)",
                ].join(", "),
            }} />

            {/* Bottom bleed */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "38%",
                background: "linear-gradient(to bottom, transparent 0%, rgba(18,16,16,0.4) 45%, rgba(18,16,16,0.85) 75%, #121010 100%)",
                zIndex: 2,
                pointerEvents: "none",
            }} />

            {/* Content */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
            }}>
                <div className="hero-fs-inner">
                    <span className="hero-fs-eyebrow">{t.hero.eyebrow}</span>
                    <h1 className="hero-fs-headline">
                        {t.hero.headline1}<br />
                        <span style={{ color: "var(--accent)" }}>{t.hero.headline2}</span>
                    </h1>
                    <div className="hero-fs-rule" />
                    <p className="hero-fs-subtitle">
                        {t.hero.subtitle}
                    </p>
                    <Link href="/autos" className="hero-fs-cta">
                        {t.hero.cta}
                    </Link>
                </div>
            </div>

        </section>
    );
}
