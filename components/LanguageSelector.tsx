'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSelector() {
    const { lang, setLang } = useLanguage();

    return (
        <div className="lang-selector" aria-label="Seleccionar idioma">
            {/* Globe icon */}
            <svg
                className="lang-globe"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>

            {/* Pill toggle */}
            <div className="lang-pill">
                {/* Sliding indicator */}
                <span
                    className="lang-indicator"
                    style={{ transform: lang === 'en' ? 'translateX(100%)' : 'translateX(0%)' }}
                    aria-hidden="true"
                />
                <button
                    onClick={() => setLang('es')}
                    className={`lang-btn${lang === 'es' ? ' lang-btn--active' : ''}`}
                    aria-label="Español"
                    aria-pressed={lang === 'es'}
                >
                    ES
                </button>
                <button
                    onClick={() => setLang('en')}
                    className={`lang-btn${lang === 'en' ? ' lang-btn--active' : ''}`}
                    aria-label="English"
                    aria-pressed={lang === 'en'}
                >
                    EN
                </button>
            </div>

            <style>{`
                .lang-selector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: default;
                }

                .lang-globe {
                    color: var(--text-muted);
                    flex-shrink: 0;
                    transition: color 0.2s, transform 0.6s ease;
                    animation: lang-globe-spin 8s linear infinite;
                    animation-play-state: paused;
                }

                .lang-selector:hover .lang-globe {
                    color: var(--text-primary);
                    animation-play-state: running;
                }

                @keyframes lang-globe-spin {
                    0%   { transform: rotate(0deg); }
                    25%  { transform: rotate(15deg); }
                    75%  { transform: rotate(-15deg); }
                    100% { transform: rotate(0deg); }
                }

                .lang-pill {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: var(--clr-surface-a10, rgba(255,255,255,0.08));
                    border-radius: 100px;
                    padding: 2px;
                    gap: 0;
                    border: 1px solid var(--clr-surface-a20, rgba(255,255,255,0.12));
                    overflow: hidden;
                }

                .lang-indicator {
                    position: absolute;
                    left: 2px;
                    top: 2px;
                    width: calc(50% - 2px);
                    height: calc(100% - 4px);
                    background: var(--accent, #d11119);
                    border-radius: 100px;
                    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                    pointer-events: none;
                    box-shadow: 0 1px 4px rgba(209,17,25,0.4);
                }

                .lang-btn {
                    position: relative;
                    z-index: 1;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    padding: 4px 9px;
                    border-radius: 100px;
                    line-height: 1;
                    font-family: inherit;
                    color: var(--text-muted);
                    transition: color 0.2s;
                    user-select: none;
                }

                .lang-btn--active {
                    color: #fff;
                }

                .lang-btn:not(.lang-btn--active):hover {
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
}
