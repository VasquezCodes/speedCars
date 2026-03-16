'use client';

import Link from "next/link";
import { useState, useRef, useCallback } from "react";

const VIDEOS = ["/hero9.mp4", "/hero3.mp4", "/hero7.mp4", "/hero6.mp4"];
const FADE_MS = 900;

export default function HeroSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const activeIdxRef = useRef(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);

    const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
        videoRefs.current[index] = el;
    };

    const handleEnded = useCallback(() => {
        const current = activeIdxRef.current;
        const next = (current + 1) % VIDEOS.length;
        const nextVideo = videoRefs.current[next];
        if (nextVideo) {
            nextVideo.currentTime = 0;
            nextVideo.play().catch(() => { });
        }
        activeIdxRef.current = next;
        setActiveIdx(next);
    }, []);

    return (
        <section className="hero-fs">
            {/* Background videos */}
            {VIDEOS.map((src, index) => (
                <video
                    key={src}
                    ref={setVideoRef(index)}
                    src={src}
                    muted
                    playsInline
                    autoPlay={index === 0}
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

            {/* Cinematic overlay — left vignette + top darkening */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background: [
                    "linear-gradient(to bottom, rgba(18,16,16,0.08) 0%, rgba(18,16,16,0.45) 55%, rgba(18,16,16,0.92) 82%, #121010 100%)",
                    "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 75%)",
                ].join(", "),
            }} />

            {/* Bottom bleed — dissolves hero edge into page background */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "38%",
                background: "linear-gradient(to bottom, transparent 0%, rgba(18,16,16,0.55) 45%, rgba(18,16,16,0.92) 75%, #121010 100%)",
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
                {/* Centered container */}
                <div className="hero-fs-inner">
                    <span className="hero-fs-eyebrow">FF Speed Cars · Fort Worth, TX</span>
                    <h1 className="hero-fs-headline">
                        Tu Auto<br />
                        <span style={{ color: "var(--accent)" }}>Hoy.</span>
                    </h1>
                    <div className="hero-fs-rule" />
                    <p className="hero-fs-subtitle">
                        Calidad, precio y transparencia para que te lleves el vehículo de tus sueños con total confianza.
                    </p>
                    <Link href="/autos" className="hero-fs-cta">
                        Ver catálogo
                    </Link>
                </div>
            </div>

        </section>
    );
}
