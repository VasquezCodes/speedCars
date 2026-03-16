'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

const BRANDS = [
  { name: "FORD", file: "ford-svgrepo-com.svg" },
  { name: "HONDA", file: "honda-svgrepo-com.svg" },
  { name: "NISSAN", file: "nissan-svgrepo-com.svg" },
  { name: "JEEP", file: "jeep-alt-svgrepo-com.svg" },
  { name: "MERCEDES", file: "mercedes-benz-alt-svgrepo-com.svg" },
  { name: "KIA", file: "kia-svgrepo-com.svg" },
  { name: "MAZDA", file: "mazda-alt-svgrepo-com.svg" },
  { name: "LEXUS", file: "lexus-svgrepo-com.svg" }
];

export default function BrandDivider() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % BRANDS.length);
        setFade(true);
      }, 500); // Tiempo de fade out
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      padding: '0 20px'
    }}>
      {/* Línea que se difumina hacia la izquierda */}
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--clr-surface-a30) 80%, var(--clr-surface-a40))'
      }} />
      
      {/* Contenedor central de la marca */}
      <div style={{
        padding: '0 32px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-rb-rational), sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        minWidth: '220px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        filter: 'brightness(0) invert(1) opacity(0.55)' // Invierte a blanco para fondo oscuro
      }}>
        <Image 
          src={`/carBrands/${BRANDS[index].file}`} 
          alt={`${BRANDS[index].name} logo`} 
          width={64} 
          height={64} 
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Línea que se difumina hacia la derecha */}
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to left, transparent, var(--clr-surface-a30) 80%, var(--clr-surface-a40))'
      }} />
    </div>
  );
}
