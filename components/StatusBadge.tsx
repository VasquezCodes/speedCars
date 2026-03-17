'use client';

import { useLanguage } from '@/context/LanguageContext';

export type BadgeStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'Retirado';
export type BadgeVariant = 'overlay' | 'inline';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

interface FeaturedBadgeProps {
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

// ─── Inline SVG icons using original paths ────────────────────────────────────

const IconDisponible = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11.7071 6.70711C12.0976 6.31658 12.0976 5.68342 11.7071 5.29289C11.3166 4.90237 10.6834 4.90237 10.2929 5.29289L7 8.58579L5.70711 7.29289C5.31658 6.90237 4.68342 6.90237 4.29289 7.29289C3.90237 7.68342 3.90237 8.31658 4.29289 8.70711L6.29289 10.7071C6.68342 11.0976 7.31658 11.0976 7.70711 10.7071L11.7071 6.70711Z" fill="currentColor"/>
    <path d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8ZM8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" fill="currentColor"/>
  </svg>
);

const IconDestacado = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 7L13 15L9 11L3 17M21 7H15M21 7V13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconReservado = () => (
  <svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M511.746,374.302l-39.385-242.905c-1.547-9.535-9.779-16.542-19.439-16.542H76.029l3.194,19.692l3.193,19.692 l32.999,203.52l3.194,19.692l3.193,19.692h370.505c5.774,0,11.256-2.534,14.998-6.93 C511.046,385.818,512.67,380.001,511.746,374.302z M393.846,275.693H196.922c-10.875,0-19.692-8.818-19.692-19.692 c0-10.877,8.817-19.692,19.692-19.692h196.923c10.875,0,19.692,8.816,19.692,19.692 C413.538,266.875,404.721,275.693,393.846,275.693z"/>
    <path d="M78.708,377.451l-3.193-19.691L59.175,256.981L49.2,195.463l-9.975-61.519L0.254,374.3 c-0.924,5.699,0.7,11.516,4.441,15.913c3.742,4.398,9.224,6.93,14.998,6.93h62.209L78.708,377.451z"/>
  </svg>
);

const IconRetirado = () => (
  <svg width="13" height="13" viewBox="0 0 596.7 596.7" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M233.401,199.496l3.418-29.707c121.029,13.926,163.694,52.406,163.694,52.406s-1.848-147.22-150.812-164.359l3.418-29.707 l-139.563,70.76L233.401,199.496z"/>
    <polygon points="77.537,195.251 0,195.251 0,241.151 47.922,241.151 76.993,305.411 596.7,305.411 596.7,259.511 106.607,259.511"/>
    <rect x="113.22" y="336.012" width="459" height="45.898"/>
    <rect x="140.76" y="412.512" width="403.92" height="45.898"/>
    <circle cx="194.31" cy="524.201" r="44.37"/>
    <circle cx="494.189" cy="524.201" r="44.37"/>
  </svg>
);

const IconVendido = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  icon: React.ReactNode;
  label: string;
  inline: { bg: string; color: string; border: string };
  overlay: { dot: string };
}> = {
  Disponible: {
    icon: <IconDisponible />,
    label: 'Disponible',
    inline: { bg: 'rgba(220, 252, 231, 0.9)', color: '#14532d', border: '#86efac' },
    overlay: { dot: '#22c55e' },
  },
  Reservado: {
    icon: <IconReservado />,
    label: 'Reservado',
    inline: { bg: 'rgba(254, 243, 199, 0.9)', color: '#78350f', border: '#fcd34d' },
    overlay: { dot: '#f59e0b' },
  },
  Vendido: {
    icon: <IconVendido />,
    label: 'Vendido',
    inline: { bg: 'rgba(219, 234, 254, 0.9)', color: '#1e3a8a', border: '#93c5fd' },
    overlay: { dot: '#3b82f6' },
  },
  Retirado: {
    icon: <IconRetirado />,
    label: 'Retirado',
    inline: { bg: 'rgba(243, 244, 246, 0.9)', color: '#374151', border: '#d1d5db' },
    overlay: { dot: '#9ca3af' },
  },
};

// ─── Components ───────────────────────────────────────────────────────────────

export function StatusBadge({ status, variant = 'inline', style }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const label = (t.statusLabels as Record<string, string>)[status] ?? config.label;

  if (variant === 'overlay') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 11px 5px 8px',
        borderRadius: '40px',
        background: 'rgba(12, 12, 12, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        color: '#fff',
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style,
      }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: config.overlay.dot,
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${config.overlay.dot}33`,
        }} />
        <span style={{ opacity: 0.85, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </span>
        {label}
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 12px 5px 9px',
      borderRadius: '40px',
      background: config.inline.bg,
      border: `1.5px solid ${config.inline.border}`,
      color: config.inline.color,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      lineHeight: 1,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      ...style,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
        {config.icon}
      </span>
      {label}
    </div>
  );
}

export function FeaturedBadge({ variant = 'inline', style }: FeaturedBadgeProps) {
  const { t } = useLanguage();
  const label = t.featuredLabel;

  if (variant === 'overlay') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 11px 5px 9px',
        borderRadius: '40px',
        background: 'rgba(12, 12, 12, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(220, 38, 38, 0.5)',
        boxShadow: '0 2px 12px rgba(220,38,38,0.2)',
        color: '#fca5a5',
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#f87171' }}>
          <IconDestacado />
        </span>
        {label}
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 12px 5px 9px',
      borderRadius: '40px',
      background: 'rgba(254, 226, 226, 0.9)',
      border: '1.5px solid #fca5a5',
      color: '#991b1b',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      lineHeight: 1,
      ...style,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.85 }}>
        <IconDestacado />
      </span>
      {label}
    </div>
  );
}
