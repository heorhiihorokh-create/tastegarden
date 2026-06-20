'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { Lantern } from '@/components/ui/Lantern';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, Close, ArrowRight, Phone, MapPin } from '@/components/ui/Icons';

const links = [
  { id: 'concept', href: '#concept' },
  { id: 'stations', href: '#stations' },
  { id: 'dishes', href: '#dishes' },
  { id: 'formules', href: '#formules' },
  { id: 'practical', href: '#practical' },
] as const;

// Hanging lanterns: varied size / sway timing for a natural, lively row.
const lanterns = [
  { size: 26, delay: 0, dur: 5.2, drop: 12 },
  { size: 34, delay: 0.8, dur: 6.1, drop: 20 },
  { size: 22, delay: 0.3, dur: 4.6, drop: 9 },
  { size: 30, delay: 1.2, dur: 5.6, drop: 16 },
  { size: 24, delay: 0.5, dur: 5.0, drop: 11 },
  { size: 32, delay: 0.2, dur: 6.4, drop: 18 },
  { size: 26, delay: 1.0, dur: 4.9, drop: 13 },
];

const woodStyle: React.CSSProperties = {
  backgroundColor: '#34200f',
  backgroundImage: [
    'linear-gradient(180deg, rgba(255,214,160,0.12), rgba(0,0,0,0.16) 55%, rgba(0,0,0,0.34))',
    'repeating-linear-gradient(89deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 7px)',
    'repeating-linear-gradient(90deg, rgba(150,95,55,0.10) 0 3px, rgba(70,40,20,0.10) 3px 10px)',
    'linear-gradient(180deg, #5a3720 0%, #3d240f 55%, #2a1709 100%)',
  ].join(','),
  boxShadow:
    'inset 0 1px 0 rgba(255,225,180,0.22), inset 0 -3px 8px rgba(0,0,0,0.55), 0 18px 36px -16px rgba(0,0,0,0.8)',
};

export function Header() {
  const t = useTranslations('nav');
  const p = useTranslations('practical');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`px-3 transition-all duration-500 ease-smooth sm:px-5 ${scrolled ? 'pt-0' : 'pt-3 sm:pt-4'}`}>
        {/* Wooden plaque */}
        <div
          className={`relative mx-auto flex max-w-content items-center justify-between transition-all duration-500 ease-smooth ${
            scrolled
              ? 'h-[60px] rounded-b-2xl px-4 sm:px-6'
              : 'h-[68px] rounded-2xl px-4 sm:h-[76px] sm:px-6'
          }`}
          style={woodStyle}
        >
          {/* Gilt frame + corner brackets */}
          <span className="pointer-events-none absolute inset-[5px] rounded-[14px] border border-ember/45" />
          <span className="pointer-events-none absolute inset-[9px] rounded-[10px] border border-ember/15" />
          {['left-2 top-2 border-l-2 border-t-2', 'right-2 top-2 border-r-2 border-t-2', 'left-2 bottom-2 border-l-2 border-b-2', 'right-2 bottom-2 border-r-2 border-b-2'].map((c) => (
            <span key={c} className={`pointer-events-none absolute h-3.5 w-3.5 rounded-[3px] border-ember/70 ${c}`} />
          ))}

          {/* Logo */}
          <a href="#top" aria-label="Taste Garden" className="relative z-10 flex items-center">
            <Logo priority width={scrolled ? 96 : 116} className="transition-all duration-500" />
          </a>

          {/* Actions */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
            <a
              href="#reservation"
              className="hidden items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-[0.86rem] font-semibold text-cream shadow-[0_10px_24px_-12px_rgba(193,39,45,0.9)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-crimson-bright sm:inline-flex"
            >
              {t('reserve')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('menu')}
              aria-expanded={open}
              aria-controls="main-menu"
              className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ink/35 px-4 py-2.5 text-[0.86rem] font-semibold text-cream transition-colors duration-300 hover:border-ember hover:text-ember"
            >
              <Menu className="h-[18px] w-[18px]" />
              <span>{t('menu')}</span>
            </button>
          </div>

          {/* Hanging lanterns */}
          <div
            className={`pointer-events-none absolute inset-x-4 top-full flex justify-between transition-opacity duration-500 sm:inset-x-10 ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {lanterns.map((l, i) => (
              <span
                key={i}
                className={`lantern-sway block ${i > 4 ? 'hidden sm:block' : ''}`}
                style={{
                  animationDelay: `${l.delay}s`,
                  animationDuration: `${l.dur}s`,
                  marginTop: '-2px',
                }}
              >
                <Lantern size={l.size} string={l.drop} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-out menu */}
      <div
        id="main-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-[60] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Scrim */}
        <button
          type="button"
          aria-label={t('close')}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-ember/20 bg-ink-deep shadow-lift transition-transform duration-500 ease-smooth sm:w-[420px] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundImage: 'radial-gradient(120% 60% at 100% 0%, rgba(193,39,45,0.16), transparent 60%)' }}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <Logo width={104} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              tabIndex={open ? 0 : -1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-white/[0.03] text-cream transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
            {links.map((l, i) => (
              <a
                key={l.id}
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="group flex items-baseline gap-4 border-b border-cream/10 py-4 font-display text-3xl text-cream transition-colors duration-300 hover:text-ember"
                style={{
                  transform: open ? 'translateY(0)' : 'translateY(14px)',
                  opacity: open ? 1 : 0,
                  transition: `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.07 * i + 0.12}s, opacity 0.5s ease ${0.07 * i + 0.12}s, color 0.3s ease`,
                }}
              >
                <span className="font-sans text-xs text-ember/70">0{i + 1}</span>
                {t(l.id)}
              </a>
            ))}
          </nav>

          <div className="px-6 pb-8">
            <a
              href="#reservation"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-crimson py-4 text-sm font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright"
            >
              {t('reserve')}
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-5 flex flex-col gap-3 text-sm text-cream/70">
              <a href="tel:+3251303888" className="inline-flex items-center gap-2.5 transition-colors hover:text-ember">
                <Phone className="h-[18px] w-[18px] text-ember" />
                <span className="tabular">{p('phone1')}</span>
              </a>
              <span className="inline-flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ember" />
                <span className="whitespace-pre-line">{p('address')}</span>
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-cream/10 pt-5">
              <span className="text-xs uppercase tracking-eyebrow text-cream/40">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
