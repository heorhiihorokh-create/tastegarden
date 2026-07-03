'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@/lib/useTheme';

/**
 * Theme switch. Flips `data-theme` on <html> and persists it.
 * The icon is driven by `useTheme()` (reads the page/html theme) rather than CSS,
 * so it shows the correct sun/moon even when the toggle sits inside a
 * dark-pinned navbar.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('nav');
  const theme = useTheme();

  const toggle = () => {
    const el = document.documentElement;
    const next = el.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    el.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode / blocked storage — ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('theme')}
      title={t('theme')}
      className={`group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-cream/[0.05] text-ember transition-all duration-300 ease-smooth hover:scale-[1.06] hover:border-ember/55 ${className}`}
    >
      {theme === 'dark' ? (
        /* Sun — tap to go light */
        <svg aria-hidden="true" className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
        </svg>
      ) : (
        /* Moon — tap to go dark */
        <svg aria-hidden="true" className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.3A8.2 8.2 0 0 1 9.7 3.5a7.3 7.3 0 1 0 10.8 10.8Z" />
        </svg>
      )}
    </button>
  );
}
