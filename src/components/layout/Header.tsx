'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LogoMark } from '@/components/ui/LogoMark';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Menu, Close, ArrowRight, Phone, MapPin } from '@/components/ui/Icons';
import navLeft from '../../../public/images/nav-left.png';
import navMid from '../../../public/images/nav-mid.png';
import navRight from '../../../public/images/nav-right.png';
import navLeftLight from '../../../public/images/navbar-light-new-left.png';
import navMidLight from '../../../public/images/navbar-light-new-mid.png';
import navRightLight from '../../../public/images/navbar-light-new-right.png';
import lantern from '../../../public/images/lantern.png';
import menuFrame from '../../../public/images/menu-frame.png';

const links = [
  { id: 'concept', href: '#top' },
  { id: 'stations', href: '#stations' },
  { id: 'formules', href: '#formules' },
  { id: 'dishes', href: '#dishes' },
  { id: 'practical', href: '#practical' },
] as const;

// Single lantern art aspect (width / height) — used to keep every drop in proportion.
const LANTERN_AR = lantern.width / lantern.height;

// Hanging lanterns pinned to the lower edge of the red bar: evenly spaced + symmetric
// about the centre, with a gentle arch (centre hangs lowest) and lively timing.
// `vis` scales the count by width — a small flanking pair on phones, 3 on tablet,
// all 5 on desktop. `img`/`drop` shrink on phone so they tuck just under the bar.
const lanterns = [
  { left: '8%', img: 'w-[26px]', drop: 'h-[10px]', dur: 6.6, delay: 0.0, vis: 'hidden lg:block' },
  { left: '27%', img: 'w-[24px] sm:w-[32px]', drop: 'h-[14px] sm:h-[18px]', dur: 5.6, delay: 0.6, vis: 'block' },
  { left: '50%', img: 'w-[36px]', drop: 'h-[22px]', dur: 6.9, delay: 0.25, vis: 'hidden sm:block' },
  { left: '73%', img: 'w-[24px] sm:w-[32px]', drop: 'h-[14px] sm:h-[18px]', dur: 5.9, delay: 0.85, vis: 'block' },
  { left: '92%', img: 'w-[26px]', drop: 'h-[10px]', dur: 6.3, delay: 0.4, vis: 'hidden lg:block' },
];

export function Header() {
  const t = useTranslations('nav');
  const p = useTranslations('practical');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // Scroll state + scroll-spy in ONE rAF-throttled handler: scroll events fire on
  // every Lenis/GSAP frame, and layout reads (getBoundingClientRect) interleaved
  // with their transform writes force synchronous layout. Coalescing to at most
  // one measurement per frame keeps scrolling smooth.
  //
  // Scroll-spy: highlight only the section currently in view. Nothing is highlighted on the
  // hero (no matching link); the last section (reservation) activates when scrolled to the
  // bottom, where it can't reach the activation line on its own.
  useEffect(() => {
    const ids = [...links.map((l) => l.href.slice(1)), 'reservation'];
    let raf = 0;
    const compute = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      const doc = document.documentElement;
      // At the very bottom the last section can't reach the line — force it active.
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        setActive(ids[ids.length - 1]);
        return;
      }
      const line = window.innerHeight * 0.32;
      let straddle = ''; // section the activation line currently falls within
      let passed = ''; // last section whose top has crossed the line (covers gaps)
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line) passed = id;
        if (r.top <= line && r.bottom > line) straddle = id;
      }
      setActive(straddle || passed);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
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

  const navRow = (
    <>
      <a
        href="#top"
        aria-label="Taste Garden"
        className="relative z-10 flex shrink-0 items-center"
      >
        <LogoMark
          priority
          className="h-[26px] w-auto transition-all duration-500 sm:h-[32px] lg:h-[38px]"
        />
      </a>

      <nav className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:flex xl:gap-7">
        {links.map((l) => {
          const isActive = active === l.href.slice(1);
          return (
            <a
              key={l.id}
              href={l.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative whitespace-nowrap text-[0.88rem] font-medium tracking-tight transition-colors duration-300 ${
                isActive ? 'text-ember' : 'text-cream hover:text-ember'
              }`}
            >
              {t(l.id)}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ease-smooth ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          );
        })}
        <a
          href="#reservation"
          aria-current={active === 'reservation' ? 'page' : undefined}
          className={`group relative whitespace-nowrap text-[0.88rem] font-semibold tracking-tight transition-colors duration-300 ${
            active === 'reservation' ? 'text-ember' : 'text-cream hover:text-ember'
          }`}
        >
          {t('reserve')}
          <span
            className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ease-smooth ${
              active === 'reservation' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </a>
      </nav>

      <div className="relative z-10 -mr-4 flex shrink-0 items-center gap-2.5 sm:-mr-6 lg:mr-0">
        <ThemeToggle className="hidden lg:inline-flex" />
        <div className="hidden lg:block">
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('menu')}
          aria-expanded={open}
          aria-controls="main-menu"
          className="group relative inline-flex h-[36px] w-[96px] shrink-0 items-center justify-center transition-transform duration-300 ease-smooth hover:scale-[1.04] sm:h-[40px] sm:w-[107px] lg:hidden"
        >
          <Image
            src={menuFrame}
            alt=""
            aria-hidden
            priority
            className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          />
          <span className="relative z-10 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-ember-soft transition-colors duration-300 group-hover:text-cream">
            <Menu className="h-[15px] w-[15px]" />
            {t('menu')}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className={`px-2 transition-all duration-500 ease-smooth sm:px-5 ${scrolled ? 'pt-0' : 'pt-2 sm:pt-3'}`}>
        <div className="relative mx-auto max-w-content">
          {/* Ornate frame (left cap · stretchable middle · right cap) — sits above the lanterns */}
          <div
            className={`relative z-10 flex w-full items-stretch transition-all duration-500 ease-smooth ${
              scrolled ? 'h-[64px] sm:h-[78px]' : 'h-[74px] sm:h-[92px] lg:h-[100px]'
            }`}
          >
            {/* Frosted glass BEHIND the caps + frame. Inset ~28px so its left/right edges land under
                the caps' SOLID board (which hides them) but stop short of the caps' transparent outer
                corners (so it never peeks out past the board art). 28px stays under the board for every
                bar height (64–100px). The frame/rails hide the top/bottom edges. Fully adaptive. */}
            {/* Backing behind the frame opening. The light cutout from white_theme has a
                transparent centre, so keep the glass only under that window — not under
                the outer ornaments/candles, otherwise the cap reads like a torn rectangle. */}
            <div className="dark-only pointer-events-none absolute inset-x-[28px] top-[10%] z-0 h-[80%] bg-ink/55 backdrop-blur-[10px]" />
            {/* Light backing — same logic as dark: a plain rectangle BEHIND the whole frame
                (z-0), inset so its edges tuck under the caps' board and the rails, and only
                the frame's transparent window reveals it. No rounding/shadow, so no edge can
                peek out past the ornaments. */}
            <div className="light-only pointer-events-none absolute inset-x-[30px] top-[10%] z-0 h-[80%] bg-[linear-gradient(180deg,rgba(255,250,241,0.82),rgba(232,216,190,0.74))] backdrop-blur-[12px]" />

            {/* ---- Light frame: same 3-piece adaptive technique as the dark frame
                 (fixed-aspect caps · stretchable middle), just its own art + ornaments.
                 Rendered via .light-only so the swap happens in CSS before paint — no flash. */}
            {/* Left cap (candles) — fixed aspect, scales with the bar height */}
            <Image
              src={navLeftLight}
              alt=""
              aria-hidden
              priority
              className="light-only relative z-30 -mr-px h-full w-auto shrink-0"
            />

            {/* Stretchable middle — the frame's window + rails */}
            <div
              className="light-only relative z-20 h-full min-w-0 flex-1"
              style={{
                backgroundImage: `url(${navMidLight.src})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Content row — centred in the window opening (identical placement logic to dark) */}
              <div className="light-navbar-content absolute inset-x-0 top-[20.4%] z-20 flex h-[53.6%] items-center justify-between gap-3 pl-4 pr-3 sm:pl-6 sm:pr-5 lg:px-8">
                {navRow}
              </div>
            </div>

            {/* Right cap (pagoda · sushi) — fixed aspect, scales with the bar height */}
            <Image
              src={navRightLight}
              alt=""
              aria-hidden
              priority
              className="light-only relative z-30 -ml-px h-full w-auto shrink-0"
            />

            {/* Left cap — fixed aspect, scales with the bar height (same logic in both themes) */}
            <Image
              src={navLeft}
              alt=""
              aria-hidden
              priority
              className="dark-only relative z-30 -mr-px h-full w-auto shrink-0"
            />

            {/* Stretchable middle — the frame's opening board */}
            <div
              className="dark-only relative z-20 h-full min-w-0 flex-1"
              style={{
                backgroundImage: `url(${navMid.src})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Content row — vertically centred in the frame opening (identical placement both themes) */}
              <div className="absolute inset-x-0 top-[20.4%] z-20 flex h-[53.6%] items-center justify-between gap-3 pl-4 pr-3 sm:pl-6 sm:pr-5 lg:px-8">
                <a href="#top" aria-label="Taste Garden" className="relative z-10 flex shrink-0 items-center">
                  <LogoMark priority className="h-[26px] w-auto transition-all duration-500 sm:h-[32px] lg:h-[38px]" />
                </a>

                {/* Desktop inline nav — absolutely centred on the bar axis */}
                <nav className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:flex xl:gap-7">
                  {links.map((l) => {
                    const isActive = active === l.href.slice(1);
                    return (
                      <a
                        key={l.id}
                        href={l.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative whitespace-nowrap text-[0.88rem] font-medium tracking-tight transition-colors duration-300 ${
                          isActive ? 'text-ember' : 'text-cream hover:text-ember'
                        }`}
                      >
                        {t(l.id)}
                        <span
                          className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ease-smooth ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </a>
                    );
                  })}
                  <a
                    href="#reservation"
                    aria-current={active === 'reservation' ? 'page' : undefined}
                    className={`group relative whitespace-nowrap text-[0.88rem] font-semibold tracking-tight transition-colors duration-300 ${
                      active === 'reservation' ? 'text-ember' : 'text-cream hover:text-ember'
                    }`}
                  >
                    {t('reserve')}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ease-smooth ${
                        active === 'reservation' ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </a>
                </nav>

                <div className="relative z-10 -mr-4 flex shrink-0 items-center gap-2.5 sm:-mr-6 lg:mr-0">
                  <ThemeToggle className="hidden lg:inline-flex" />
                  <div className="hidden lg:block">
                    <LanguageSwitcher />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={t('menu')}
                    aria-expanded={open}
                    aria-controls="main-menu"
                    className="group relative inline-flex h-[36px] w-[96px] shrink-0 items-center justify-center transition-transform duration-300 ease-smooth hover:scale-[1.04] sm:h-[40px] sm:w-[107px] lg:hidden"
                  >
                    <Image src={menuFrame} alt="" aria-hidden priority className="pointer-events-none absolute inset-0 h-full w-full object-fill" />
                    <span className="relative z-10 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-ember-soft transition-colors duration-300 group-hover:text-cream">
                      <Menu className="h-[15px] w-[15px]" />
                      {t('menu')}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <Image
              src={navRight}
              alt=""
              aria-hidden
              priority
              className="dark-only relative z-30 -ml-px h-full w-auto shrink-0"
            />
          </div>

          {/* Hanging lanterns — behind the frame (dark theme only; the light frame has its own ornaments) */}
          <div
            className={`dark-only pointer-events-none absolute inset-x-[15%] top-0 z-0 h-full transition-opacity duration-500 ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden
          >
            {lanterns.map((l, i) => (
              <span key={i} className={`absolute top-[93%] -translate-x-1/2 ${l.vis}`} style={{ left: l.left }}>
                <span
                  className="lantern-sway flex origin-top flex-col items-center"
                  style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
                >
                  {/* thin string tucked under the bar's lower edge, down to the lantern */}
                  <span className={`block w-px bg-gradient-to-b from-ember/0 via-ember/50 to-ember/80 ${l.drop}`} />
                  <Image
                    src={lantern}
                    alt=""
                    width={72}
                    height={Math.round(72 / LANTERN_AR)}
                    className={`h-auto drop-shadow-[0_10px_16px_rgba(0,0,0,0.5)] ${l.img}`}
                  />
                </span>
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
            {links.map((l, i) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.id}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex items-baseline gap-4 border-b border-cream/10 py-4 font-display text-3xl transition-colors duration-300 ${
                    isActive ? 'text-ember' : 'text-cream hover:text-ember'
                  }`}
                  style={{
                    transform: open ? 'translateY(0)' : 'translateY(14px)',
                    opacity: open ? 1 : 0,
                    transition: `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.07 * i + 0.12}s, opacity 0.5s ease ${0.07 * i + 0.12}s, color 0.3s ease`,
                  }}
                >
                  <span className={`font-sans text-xs ${isActive ? 'text-ember' : 'text-ember/70'}`}>0{i + 1}</span>
                  {t(l.id)}
                </a>
              );
            })}
          </nav>

          <div className="px-6 pb-8">
            <a
              href="#reservation"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-crimson py-4 text-sm font-semibold text-[#f4ece4] transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright"
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
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
