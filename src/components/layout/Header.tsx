'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, Close, ArrowRight, Phone, MapPin } from '@/components/ui/Icons';
import lanternsDeco from '../../../public/images/lanterns-deco.png';

const links = [
  { id: 'concept', href: '#concept' },
  { id: 'stations', href: '#stations' },
  { id: 'dishes', href: '#dishes' },
  { id: 'formules', href: '#formules' },
  { id: 'practical', href: '#practical' },
] as const;

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
          className={`relative mx-auto flex max-w-content items-center justify-between gap-4 transition-all duration-500 ease-smooth ${
            scrolled
              ? 'h-[62px] rounded-b-2xl px-4 sm:px-7'
              : 'h-[70px] rounded-2xl px-4 sm:h-[80px] sm:px-7'
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
          <a href="#top" aria-label="Taste Garden" className="relative z-10 flex shrink-0 items-center">
            <Logo priority width={scrolled ? 132 : 150} className="h-auto w-[112px] transition-all duration-500 sm:w-[132px] lg:w-[150px]" />
          </a>

          {/* Desktop inline nav */}
          <nav className="relative z-10 hidden items-center gap-7 lg:flex xl:gap-9">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className="group relative whitespace-nowrap text-[0.92rem] font-medium tracking-tight text-cream/85 transition-colors duration-300 hover:text-ember"
              >
                {t(l.id)}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ember transition-all duration-300 ease-smooth group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="relative z-10 flex shrink-0 items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Single premium Reserve button (desktop) */}
            <a
              href="#reservation"
              className="hidden items-center gap-2 rounded-full border border-ember/55 bg-crimson px-6 py-2.5 text-[0.9rem] font-semibold tracking-tight text-cream shadow-[0_12px_26px_-14px_rgba(193,39,45,0.95)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-ember hover:bg-crimson-bright lg:inline-flex"
            >
              {t('reserve')}
              <ArrowRight className="h-4 w-4" />
            </a>

            {/* Burger — mobile / tablet only */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('menu')}
              aria-expanded={open}
              aria-controls="main-menu"
              className="inline-flex items-center gap-2 rounded-full border border-ember/45 bg-ink/35 px-4 py-2.5 text-[0.86rem] font-semibold tracking-tight text-cream transition-colors duration-300 hover:border-ember hover:text-ember lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
              <span>{t('menu')}</span>
            </button>
          </div>

          {/* Real hanging lanterns (decorative) — left of centre so they clear logo + blossom */}
          <span
            className={`lantern-sway pointer-events-none absolute left-[38%] top-full block origin-top transition-opacity duration-500 sm:left-[26%] lg:left-[12.5rem] ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ marginTop: '-6px' }}
          >
            <Image
              src={lanternsDeco}
              alt=""
              aria-hidden
              width={132}
              height={132}
              className="h-auto w-[88px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] sm:w-[120px]"
            />
          </span>
        </div>
      </div>

      {/* Slide-out menu (mobile / tablet) */}
      <div
        id="main-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-[60] lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          aria-label={t('close')}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-ember/20 bg-ink-deep shadow-lift transition-transform duration-500 ease-smooth sm:w-[420px] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundImage: 'radial-gradient(120% 60% at 100% 0%, rgba(193,39,45,0.16), transparent 60%)' }}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <Logo width={120} className="h-auto w-[120px]" />
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
              <span className="text-xs uppercase tracking-eyebrow text-cream/60">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
