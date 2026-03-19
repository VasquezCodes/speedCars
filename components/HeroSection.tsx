'use client';

import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

const VIDEOS = [
    "/hero9Compressed.mp4",
    "/hero3Compressed.mp4",
    "/hero7Compressed.mp4",
    "/hero6Compressed.mp4",
];
const FADE_MS = 700;

export default function HeroSection() {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const transitioning = useRef(false);

    // Play video whenever the index changes (video remounts via key)
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const tryPlay = () => {
            const p = v.play();
            if (p !== undefined) {
                p.catch(() => {
                    const unlock = () => v.play().catch(() => {});
                    document.addEventListener("touchstart", unlock, { once: true, capture: true });
                    document.addEventListener("click",      unlock, { once: true, capture: true });
                });
            }
        };

        if (v.readyState >= 2) {
            tryPlay();
        } else {
            v.addEventListener("canplay", tryPlay, { once: true });
            return () => v.removeEventListener("canplay", tryPlay);
        }
    }, [currentIdx]);

    const handleEnded = useCallback(() => {
        if (transitioning.current) return;
        transitioning.current = true;

        setVisible(false);
        setTimeout(() => {
            setCurrentIdx(prev => (prev + 1) % VIDEOS.length);
            setVisible(true);
            transitioning.current = false;
        }, FADE_MS);
    }, []);

    return (
        <section className="hero-fs">
            {/* Video background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    opacity: visible ? 1 : 0,
                    transition: `opacity ${FADE_MS}ms ease-in-out`,
                }}
            >
                <video
                    ref={videoRef}
                    key={currentIdx}
                    src={VIDEOS[currentIdx]}
                    muted
                    playsInline
                    autoPlay
                    preload="auto"
                    onEnded={handleEnded}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center center",
                    }}
                />
            </div>

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
