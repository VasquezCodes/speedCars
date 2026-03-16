'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function VehicleDetailNav() {
    const router = useRouter();
    const [navSearch, setNavSearch] = useState('');

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'var(--primary)',
            borderBottom: '1px solid var(--clr-surface-a20)',
        }}>
            {/* Top row: logo + icons */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Image
                        src="/logo-nuevo.png"
                        alt="FF Speed Cars"
                        width={340}
                        height={100}
                        style={{ height: 72, width: 'auto', objectFit: 'contain', margin: '-10px 0' }}
                        priority
                    />
                    <Image
                        src="/racing-flag-2-svgrepo-com.svg"
                        alt=""
                        aria-hidden
                        width={32}
                        height={32}
                        style={{ filter: 'invert(1) opacity(0.65)', flexShrink: 0 }}
                    />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <a href="https://www.instagram.com/ffspeedcars/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                        <Image src="/ig.svg" alt="Instagram" width={22} height={22} style={{ opacity: 0.75 }} />
                    </a>
                    <Image src="/fb.svg" alt="Facebook" width={22} height={22} style={{ opacity: 0.75 }} />
                </div>
            </div>

            {/* Search bar */}
            <div style={{ padding: '0 16px 10px' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="¿Qué tipo de auto estás buscando?"
                        value={navSearch}
                        onChange={e => setNavSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                const q = navSearch.trim();
                                router.push(q ? `/autos?search=${encodeURIComponent(q)}` : '/autos');
                            }
                        }}
                        style={{
                            width: '100%',
                            height: 44,
                            borderRadius: 100,
                            border: '1.5px solid var(--clr-surface-a20)',
                            padding: '0 52px 0 22px',
                            fontSize: 15,
                            color: 'var(--text-primary)',
                            background: 'var(--clr-surface-a10)',
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s, background 0.2s',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'var(--clr-surface-a10)';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(209,17,25,0.12)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'var(--clr-surface-a20)';
                            e.currentTarget.style.background = 'var(--clr-surface-a10)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={() => {
                            const q = navSearch.trim();
                            router.push(q ? `/autos?search=${encodeURIComponent(q)}` : '/autos');
                        }}
                        style={{
                            position: 'absolute', right: 14, top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 4, display: 'flex', alignItems: 'center',
                        }}
                        aria-label="Buscar"
                    >
                        <Search size={20} color="var(--text-muted)" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </header>
    );
}
