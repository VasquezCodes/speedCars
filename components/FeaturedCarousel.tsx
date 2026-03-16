"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import VehicleCard, { Vehicle } from "@/components/VehicleCard";

const AUTOPLAY_MS = 3500;

function useCarouselConfig() {
  const [config, setConfig] = useState({ visible: 3, gap: 24 });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setConfig({ visible: 1, gap: 16 });
      else if (w < 1024) setConfig({ visible: 2, gap: 20 });
      else setConfig({ visible: 3, gap: 24 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return config;
}

export default function FeaturedCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { visible, gap } = useCarouselConfig();

  // Drag state — all refs to avoid re-renders during drag
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false); // true if drag moved enough to block click
  const isHorizontalRef = useRef<boolean | null>(null); // null = not yet determined

  const measure = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setCardWidth((w - gap * (visible - 1)) / visible);
    }
  }, [visible, gap]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const total = vehicles.length;
  const maxIndex = Math.max(0, total - visible);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  // Auto-advance
  useEffect(() => {
    if (total <= visible || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total, maxIndex, paused, visible]);

  const step = cardWidth + gap;

  // Clamp drag offset with rubber-band resistance at boundaries
  const clampDx = useCallback((dx: number, fromIndex: number) => {
    const atStart = fromIndex === 0;
    const atEnd = fromIndex >= maxIndex;
    if (dx > 0 && atStart) return dx * 0.2;   // rubber band: can't go before first
    if (dx < 0 && atEnd)   return dx * 0.2;   // rubber band: can't go past last
    return dx;
  }, [maxIndex]);

  // Apply transform directly to DOM (no state = no re-render during drag)
  const applyTransform = useCallback((offset: number) => {
    if (trackRef.current) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, []);

  const snapToIndex = useCallback((i: number) => {
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)";
      trackRef.current.style.transform = `translateX(${-(i * step)}px)`;
    }
  }, [step]);

  // Sync DOM transform when index or step changes (arrows, dots, resize)
  useEffect(() => {
    if (!isDraggingRef.current) snapToIndex(index);
  }, [index, snapToIndex]);

  // Attach touch events manually with passive:false so we can preventDefault
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      dragStartX.current = e.touches[0].clientX;
      dragStartY.current = e.touches[0].clientY;
      dragIndexRef.current = index;
      isDraggingRef.current = false;
      didMoveRef.current = false;
      isHorizontalRef.current = null;
      setPaused(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (dragStartX.current === null || dragStartY.current === null) return;
      const dx = e.touches[0].clientX - dragStartX.current;
      const dy = e.touches[0].clientY - dragStartY.current;

      // Determine axis on first significant movement
      if (isHorizontalRef.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isHorizontalRef.current === false) return; // vertical scroll — don't interfere
      if (isHorizontalRef.current === true) {
        e.preventDefault(); // block scroll + zoom
        isDraggingRef.current = true;
        didMoveRef.current = true;
        const clamped = clampDx(dx, dragIndexRef.current);
        applyTransform(-(dragIndexRef.current * step) + clamped);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (dragStartX.current === null || !isHorizontalRef.current) {
        dragStartX.current = null;
        setPaused(false);
        return;
      }
      const dx = e.changedTouches[0].clientX - dragStartX.current;
      const threshold = step * 0.2;
      let newIndex = dragIndexRef.current;
      if (dx < -threshold) newIndex = Math.min(maxIndex, dragIndexRef.current + 1);
      else if (dx > threshold) newIndex = Math.max(0, dragIndexRef.current - 1);
      dragStartX.current = null;
      isDraggingRef.current = false;
      isHorizontalRef.current = null;
      snapToIndex(newIndex);
      setIndex(newIndex);
      setPaused(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [index, step, maxIndex, applyTransform, snapToIndex]);

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragIndexRef.current = index;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    setPaused(true);
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || dragStartX.current === null) return;
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 4) didMoveRef.current = true;
      const clamped = clampDx(dx, dragIndexRef.current);
      applyTransform(-(dragIndexRef.current * step) + clamped);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current || dragStartX.current === null) return;
      const dx = e.clientX - dragStartX.current;
      const threshold = step * 0.2;
      let newIndex = dragIndexRef.current;
      if (dx < -threshold) newIndex = Math.min(maxIndex, dragIndexRef.current + 1);
      else if (dx > threshold) newIndex = Math.max(0, dragIndexRef.current - 1);
      dragStartX.current = null;
      isDraggingRef.current = false;
      snapToIndex(newIndex);
      setIndex(newIndex);
      setPaused(false);
      if (containerRef.current) containerRef.current.style.cursor = "grab";
      // Reset didMoveRef after click event fires
      setTimeout(() => { didMoveRef.current = false; }, 0);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [step, maxIndex, applyTransform, snapToIndex, clampDx]);

  const btnStyle = (enabled: boolean): React.CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `1px solid ${enabled ? "var(--clr-surface-a30)" : "var(--clr-surface-a20)"}`,
    background: enabled ? "var(--clr-surface-a10)" : "var(--clr-surface-a0)",
    color: enabled ? "var(--clr-light-a0)" : "var(--clr-surface-a40)",
    cursor: enabled ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, border-color 0.2s",
    flexShrink: 0,
  });

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Carousel track */}
      <div
        ref={containerRef}
        style={{ overflow: "hidden", cursor: "grab", userSelect: "none" }}
        onMouseDown={onMouseDown}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: gap,
            transform: `translateX(${-(index * step)}px)`,
            willChange: "transform",
          }}
        >
          {vehicles.map((v) => (
            <div
              key={v.id}
              style={{ flex: `0 0 ${cardWidth > 0 ? cardWidth : 0}px`, minWidth: 0 }}
              onClickCapture={(e) => { if (didMoveRef.current) { e.preventDefault(); e.stopPropagation(); } }}
            >
              <VehicleCard vehicle={v} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {total > visible && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  border: "none",
                  background: i === index ? "var(--clr-light-a0)" : "var(--clr-surface-a30)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.3s, background 0.3s",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={prev}
              disabled={!canPrev}
              aria-label="Anterior"
              style={btnStyle(canPrev)}
              onMouseEnter={(e) => { if (canPrev) e.currentTarget.style.background = "var(--clr-surface-a20)"; }}
              onMouseLeave={(e) => { if (canPrev) e.currentTarget.style.background = "var(--clr-surface-a10)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              aria-label="Siguiente"
              style={btnStyle(canNext)}
              onMouseEnter={(e) => { if (canNext) e.currentTarget.style.background = "var(--clr-surface-a20)"; }}
              onMouseLeave={(e) => { if (canNext) e.currentTarget.style.background = "var(--clr-surface-a10)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
