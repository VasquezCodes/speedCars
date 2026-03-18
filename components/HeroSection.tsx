'use client';

import Link from "next/link";
import { useRef, useEffect, useCallback, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const VIDEOS = ["/hero9.mp4", "/hero3.mp4", "/hero7.mp4", "/hero6.mp4"];
const FADE_MS = 800;

export default function HeroSection() {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const idxRef = useRef(0);
    const [fading, setFading] = useState(false);

    // Force muted + playsinline via attributes (iOS needs both the prop AND the attribute)
    const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
        if (el) {
            el.muted = true;
            el.setAttribute("muted", "");
            el.setAttribute("playsinline", "");
            el.setAttribute("webkit-playsinline", "");
        }
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    }, []);

    // Initial play — also retry on user interaction if autoplay was blocked
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const tryPlay = () => {
            v.muted = true;
            v.play().catch(() => {});
        };

        tryPlay();

        // Fallback: if iOS blocked autoplay, retry on first user interaction
        const onInteract = () => {
            tryPlay();
            cleanup();
        };
        const cleanup = () => {
            document.removeEventListener("touchstart", onInteract);
            document.removeEventListener("click", onInteract);
        };
        document.addEventListener("touchstart", onInteract, { once: true });
        document.addEventListener("click", onInteract, { once: true });

        return cleanup;
    }, []);

    const handleEnded = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;

        // Fade out
        setFading(true);

        setTimeout(() => {
            // Switch to next video
            const next = (idxRef.current + 1) % VIDEOS.length;
            idxRef.current = next;
            v.src = VIDEOS[next];
            v.load();
            v.muted = true;

            const onCanPlay = () => {
                v.removeEventListener("canplay", onCanPlay);
                // Fade back in
                setFading(false);
                v.play().catch(() => {});
            };
            v.addEventListener("canplay", onCanPlay);

            // Safety: if canplay doesn't fire within 2s, play anyway
            setTimeout(() => {
                v.removeEventListener("canplay", onCanPlay);
                setFading(false);
                v.play().catch(() => {});
            }, 2000);
        }, FADE_MS);
    }, []);

    return (
        <section className="hero-fs">
            {/* Single background video */}
            <video
                ref={setVideoRef}
                src={VIDEOS[0]}
                playsInline
                autoPlay
                muted
                preload="auto"
                onEnded={handleEnded}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                    opacity: fading ? 0 : 1,
                    transition: `opacity ${FADE_MS}ms ease-in-out`,
                    zIndex: 0,
                }}
            />

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
