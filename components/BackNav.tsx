'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackNav({ href = '/autos' }: { href?: string }) {
    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
        }}>
            <Link
                href={href}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    color: 'var(--text-primary)',
                    transition: 'background 0.15s',
                    textDecoration: 'none',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                aria-label="Volver al catálogo"
            >
                <ArrowLeft size={22} strokeWidth={2} />
            </Link>
        </header>
    );
}
