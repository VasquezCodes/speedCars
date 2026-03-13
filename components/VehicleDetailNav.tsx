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
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)',
        }}>
            {/* Top row: logo + icons */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        src="/logoLightMode.jpeg"
                        alt="FF Speed Cars"
                        width={220}
                        height={64}
                        style={{ height: 52, width: 'auto', objectFit: 'contain' }}
                        priority
                    />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Image src="/ig.svg" alt="Instagram" width={22} height={22} style={{ opacity: 0.7 }} />
                    <Image src="/fb.svg" alt="Facebook" width={22} height={22} style={{ opacity: 0.7 }} />
                </div>
            </div>

            {/* Search bar */}
            <div style={{ padding: '0 20px 12px' }}>
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
                            border: '2px solid var(--gray-200)',
                            padding: '0 52px 0 22px',
                            fontSize: 15,
                            color: 'var(--text-primary)',
                            background: 'var(--gray-50)',
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s, background 0.2s',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'var(--white)';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(209,17,25,0.08)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'var(--gray-200)';
                            e.currentTarget.style.background = 'var(--gray-50)';
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
                        <Search size={20} color="#222" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </header>
    );
}
