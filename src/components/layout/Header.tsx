'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, Close, ArrowRight, Phone, MapPin } from '@/components/ui/Icons';
import navLeft from '../../../public/images/nav-left.png';
import navMid from '../../../public/images/nav-mid.png';
import navRight from '../../../public/images/nav-right.png';
import lanternsDeco from '../../../public/images/lanterns-deco.png';

const links = [
  { id: 'concept', href: '#concept' },
  { id: 'stations', href: '#stations' },
  { id: 'dishes', href: '#dishes' },
  { id: 'formules', href: '#formules' },
  { id: 'practical', href: '#practical' },
] as const;

// Extra hanging lanterns — varied size / drop / timing so they feel alive (never identical).
const lanterns = [
  { left: '30%', w: 44, top: 0, dur: 6.2, delay: 0, hideMobile: true },
  { left: '46%', w: 58, top: 12, dur: 5.2, delay: 0.7 },
  { left: '64%', w: 42, top: 2, dur: 6.8, delay: 0.3 },
  { left: '80%', w: 52, top: 16, dur: 5.6, delay: 1.1, hideMobile: true },
];

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
      <div className={`px-2 transition-all duration-500 ease-smooth sm:px-5 ${scrolled ? 'pt-0' : 'pt-2 sm:pt-3'}`}>
        <div className="relative mx-auto max-w-content">
          {/* Ornate frame (left cap · stretchable middle · right cap) */}
          <div
            className={`relative flex w-full items-stretch transition-all duration-500 ease-smooth ${
              scrolled ? 'h-[64px] sm:h-[78px]' : 'h-[74px] sm:h-[92px] lg:h-[100px]'
            }`}
          >
            <Image src={navLeft} alt="" aria-hidden priority className="h-full w-auto shrink-0" />

            <div
              className="relative h-full min-w-0 flex-1"
              style={{
                backgroundImage: `url(${navMid.src})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Legibility panel sitting inside the frame opening */}
              <div className="absolute inset-x-0 top-[18%] bottom-[30%] bg-ink/45 backdrop-blur-[6px]" />

              {/* Content row inside the opening */}
              <div className="absolute inset-0 flex items-center justify-between gap-3 px-4 pb-[6%] sm:px-6 lg:px-8">
                <a href="#top" aria-label="Taste Garden" className="relative z-10 flex shrink-0 items-center">
                  <Logo priority width={180} className="h-[32px] w-auto transition-all duration-500 sm:h-[42px] lg:h-[50px]" />
                </a>

                {/* Desktop inline nav */}
                <nav className="relative z-10 hidden items-center gap-5 lg:flex xl:gap-7">
                  {links.map((l) => (
                    <a
                      key={l.id}
                      href={l.href}
                      className="group relative whitespace-nowrap text-[0.88rem] font-medium tracking-tight text-cream transition-colors duration-300 hover:text-ember"
                    >
                      {t(l.id)}
                      <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ember transition-all duration-300 ease-smooth group-hover:w-full" />
                    </a>
                  ))}
                  <a
                    href="#reservation"
                    className="group relative whitespace-nowrap text-[0.88rem] font-semibold tracking-tight text-ember transition-colors duration-300 hover:text-ember-soft"
                  >
                    {t('reserve')}
                    <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ember/50 transition-all duration-300 ease-smooth group-hover:bg-ember" />
                  </a>
                </nav>

                <div className="relative z-10 flex shrink-0 items-center gap-2.5">
                  <div className="hidden lg:block">
                    <LanguageSwitcher />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={t('menu')}
                    aria-expanded={open}
                    aria-controls="main-menu"
                    className="inline-flex items-center gap-2 rounded-full border border-ember/45 bg-ink/40 px-3.5 py-2 text-[0.82rem] font-semibold tracking-tight text-cream transition-colors duration-300 hover:border-ember hover:text-ember lg:hidden"
                  >
                    <Menu className="h-[18px] w-[18px]" />
                    <span>{t('menu')}</span>
                  </button>
                </div>
              </div>
            </div>

            <Image src={navRight} alt="" aria-hidden priority className="h-full w-auto shrink-0" />
          </div>

          {/* Extra hanging lanterns — staggered, lively; anchored just under the central bar */}
          <div
            className={`pointer-events-none absolute inset-x-[15%] top-[calc(100%-8px)] z-0 h-0 transition-opacity duration-500 ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden
          >
            {lanterns.map((l, i) => (
              <span
                key={i}
                className={`lantern-sway absolute top-0 block origin-top ${l.hideMobile ? 'hidden sm:block' : ''}`}
                style={{ left: l.left, marginTop: l.top, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
              >
                <Image
                  src={lanternsDeco}
                  alt=""
                  width={l.w}
                  height={l.w}
                  className="h-auto drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
                  style={{ width: l.w }}
                />
              </span>
            ))}
          </div>
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
          className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-ember/20 bg-ink-deep shadow-lift transition-transform duration-500 ease-smooth sm:w-[420px] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundImage: 'radial-gradient(120% 60% at 100% 0%, rgba(193,39,45,0.16), transparent 60%)' }}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <Logo width={150} className="h-[40px] w-auto" />
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
