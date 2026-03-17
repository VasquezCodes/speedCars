'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Lang } from '@/lib/i18n/translations';

type LanguageContextType = {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: typeof translations.es;
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'es',
    setLang: () => {},
    t: translations.es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>('es');

    useEffect(() => {
        const stored = localStorage.getItem('lang') as Lang | null;
        if (stored === 'en' || stored === 'es') {
            setLangState(stored);
        }
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem('lang', l);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
