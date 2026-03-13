"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const STORY_IMAGES = [
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  .PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (1).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (2).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (3).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (4).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (5).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (6).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (7).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (8).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (9).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (10).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (11).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (12).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (13).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (14).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (15).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (16).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (17).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (18).PNG",
  "/clientesSatisfechos/Black & Red Modern Animated Car Rental Story Ad  (19).PNG"
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-rotación del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === STORY_IMAGES.length - 1 ? 0 : prev + 1));
    }, 3500);
    
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === STORY_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? STORY_IMAGES.length - 1 : prev - 1));
  };

  return (
    <section id="testimonios" style={{
      padding: "160px 0",
      background: "var(--primary)",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Elemento decorativo de fondo */}
      <div style={{
        position: "absolute",
        top: "-150px",
        right: "-50px",
        fontSize: "300px",
        color: "rgba(255, 255, 255, 0.02)",
        lineHeight: 1,
        zIndex: 0,
        pointerEvents: "none",
        fontFamily: "var(--font-rb-rational)",
        textTransform: "uppercase",
        letterSpacing: "-0.05em",
        whiteSpace: "nowrap"
      }}>
        Satisfacción
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>

        {/* Cabecera de sección */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "80px" }}>
          <div>
            <h2 style={{
              fontFamily: "var(--font-rb-rational), sans-serif",
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 700,
              color: "var(--black)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textTransform: "uppercase"
            }}>
              Clientes<br /><span style={{ color: "var(--accent)" }}>Satisfechos.</span>
            </h2>
            <div style={{ width: 40, height: 4, background: "var(--accent)", marginTop: "24px" }}></div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={prevSlide}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "var(--white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--white)";
                e.currentTarget.style.transform = "translateX(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <button
              onClick={nextSlide}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "var(--white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--white)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <ChevronRight size={24} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Carrusel de historias (solo imágenes) */}
        <div style={{ position: "relative", width: "100%", overflow: "visible" }}>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            perspective: "1000px",
            height: "600px" // Altura contenida para las stories
          }}>

            {STORY_IMAGES.map((imgUrl, index) => {
              // Calculamos distancia relativa al centro para hacer efecto 3D coverflow
              const offset = index - currentIndex;
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // Solo mostramos los cercanos para evitar problemas de rendering
              if (absOffset > 2) return null;

              return (
                <div key={index} style={{
                  position: "absolute",
                  width: "320px",
                  height: "560px",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: `translateX(${offset * 140}%) scale(${isCenter ? 1 : 0.85}) rotateY(${offset * -15}deg)`,
                  zIndex: isCenter ? 10 : 10 - absOffset,
                  opacity: isCenter ? 1 : 0.4,
                  cursor: isCenter ? "default" : "pointer"
                }}
                  onClick={() => !isCenter && setCurrentIndex(index)}
                >
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "24px",
                    backgroundImage: `url('${imgUrl}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: isCenter ? "0 30px 60px -12px rgba(0,0,0,0.8)" : "0 10px 30px rgba(0,0,0,0.5)",
                    filter: isCenter ? "grayscale(0%)" : "grayscale(80%)",
                    transition: "all 0.6s ease",
                    border: isCenter ? "2px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    overflow: "hidden"
                  }}>
                    {/* Elemento overlay para oscurecer los inactivos */}
                    {!isCenter && (
                      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "40px" }}>
          {STORY_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: currentIndex === index ? "32px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: currentIndex === index ? "var(--accent)" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
