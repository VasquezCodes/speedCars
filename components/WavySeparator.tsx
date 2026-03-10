'use client';

export default function WavySeparator() {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      height: '32px',
      position: 'relative',
      opacity: 1 // Full opacity since it's an accent element
    }}>
      <div
        style={{
          width: '200%',
          height: '100%',
          // Use #d11119 (the accent color)
          background: `url("data:image/svg+xml,%3Csvg width='160' height='32' viewBox='0 0 160 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 16 Q 40 4, 80 16 T 160 16' fill='none' stroke='%23d11119' stroke-width='1.5' stroke-linecap='round' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '160px 32px',
          animation: 'wave-scroll 15s linear infinite',
        }}
      />
      <style>{`
        @keyframes wave-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-160px); }
        }
      `}</style>
    </div>
  );
}
