'use client';

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const VIDEOS = ["/hero9Compressed.mp4", "/hero3Compressed.mp4", "/hero7Compressed.mp4", "/hero6Compressed.mp4"];
const FADE_MS = 800;

export default function HeroSection() {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const idxRef = useRef(0);
    const [fading, setFading] = useState(false);

    // After hydration, grab the video element rendered by dangerouslySetInnerHTML
    useEffect(() => {
        const wrapper = document.getElementById("hero-video-wrap");
        const v = wrapper?.querySelector("video") as HTMLVideoElement | null;
        if (!v) return;
        videoRef.current = v;

        let mounted = true;

        const tryPlay = () => {
            if (!mounted || !v.paused) return;
            const p = v.play();
            if (p !== undefined) {
                p.catch(() => {
                    if (!mounted) return;
                    // iOS blocked autoplay (e.g. Low Power Mode) —
                    // unlock on first user touch, which happens naturally when
                    // the user scrolls or taps anywhere on the page.
                    const unlock = () => {
                        if (!mounted) return;
                        v.play().catch(() => {});
                    };
                    document.addEventListener("touchstart", unlock, { once: true, capture: true });
                    document.addEventListener("click", unlock, { once: true, capture: true });
                });
            }
        };

        v.addEventListener("loadeddata", tryPlay, { once: true });
        v.addEventListener("canplay", tryPlay, { once: true });
        tryPlay();

        return () => {
            mounted = false;
            v.removeEventListener("loadeddata", tryPlay);
            v.removeEventListener("canplay", tryPlay);
        };
    }, []);

    // Handle video ended — transition to next video
    useEffect(() => {
        const check = () => {
            const v = videoRef.current;
            if (!v) { setTimeout(check, 200); return; }

            v.onended = () => {
                setFading(true);
                setTimeout(() => {
                    const next = (idxRef.current + 1) % VIDEOS.length;
                    idxRef.current = next;
                    v.src = VIDEOS[next];
                    v.load();

                    const onReady = () => {
                        v.removeEventListener("canplay", onReady);
                        setFading(false);
                        v.play().catch(() => {});
                    };
                    v.addEventListener("canplay", onReady);

                    // Safety fallback
                    setTimeout(() => {
                        v.removeEventListener("canplay", onReady);
                        setFading(false);
                        v.play().catch(() => {});
                    }, 3000);
                }, FADE_MS);
            };
        };
        check();
    }, []);

    // Raw HTML string — iOS Safari evaluates autoplay policy when it first
    // parses the HTML. React's hydration can strip/re-add attributes which
    // makes iOS treat the video as non-autoplay. dangerouslySetInnerHTML
    // ensures muted + playsinline + autoplay are in the very first HTML.
    const videoHtml = `<video
        src="${VIDEOS[0]}"
        muted
        playsinline
        webkit-playsinline
        autoplay
        preload="auto"
        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;z-index:0"
    ></video>`;

    return (
        <section className="hero-fs">
            <div
                id="hero-video-wrap"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: videoHtml }}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    opacity: fading ? 0 : 1,
                    transition: `opacity ${FADE_MS}ms ease-in-out`,
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
