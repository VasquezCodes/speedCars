'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';

function AppHeightFix() {
    useEffect(() => {
        // Capture real viewport height once on mount.
        // Prevents hero "jump" in Instagram/WebView browsers where
        // vh changes as the address bar appears/disappears.
        const set = () => {
            document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
        };
        set();
        // Re-capture on orientation change only (not on scroll)
        window.addEventListener('orientationchange', set);
        return () => window.removeEventListener('orientationchange', set);
    }, []);
    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AppHeightFix />
            {children}
        </LanguageProvider>
    );
}
