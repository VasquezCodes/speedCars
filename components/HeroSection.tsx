'use client';

import Link from "next/link";
import { useState, useRef, useCallback } from "react";

const VIDEOS = ["/hero3.mp4", "/hero5.mp4"];
const FADE_MS = 900; // duración del crossfade en ms

export default function HeroSection() {
    // Índice del video que está "activo" (visible encima)
    const [activeIdx, setActiveIdx] = useState(0);
    const activeIdxRef = useRef(0);

    // Refs a los dos elementos <video> (siempre montados)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null]);

    const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
        videoRefs.current[index] = el;
    };

    const handleEnded = useCallback(() => {
        const current = activeIdxRef.current;
        const next = (current + 1) % VIDEOS.length;
        const nextVideo = videoRefs.current[next];

        // Reinicia el próximo video y lo empieza a reproducir (aún con opacity 0)
        if (nextVideo) {
            nextVideo.currentTime = 0;
            nextVideo.play().catch(() => { });
        }

        // Cambia el activo → dispara el crossfade vía CSS transition
        activeIdxRef.current = next;
        setActiveIdx(next);
    }, []);

    return (
        <section className="hero-section">
            <div className="container">
                <div className="hero-card">
                    <div className="hero-image-wrap">
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
                                    zIndex: index === activeIdx ? 1 : 0,
                                }}
                            />
                        ))}
                    </div>

                    {/* Gradient overlay */}
                    <div className="hero-gradient-overlay" style={{ zIndex: 2 }} />

                    {/* Text content */}
                    <div className="hero-content" style={{ zIndex: 3 }}>
                        <h1 className="hero-headline">
                            Tu Auto Hoy!
                        </h1>
                        <p className="hero-subtitle">
                            Calidad, precio y transparencia para que te lleves el vehículo de tus sueños con total confianza.
                        </p>
                        <Link href="/autos" className="hero-cta-btn">
                            Ver catálogo
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
