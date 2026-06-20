'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, Close, ArrowRight } from '@/components/ui/Icons';

const links = [
  { id: 'concept', href: '#concept' },
  { id: 'stations', href: '#stations' },
  { id: 'dishes', href: '#dishes' },
  { id: 'formules', href: '#formules' },
  { id: 'practical', href: '#practical' },
] as const;

export function Header() {
  const t = useTranslations('nav');
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth ${
        scrolled
          ? 'border-b border-cream/10 bg-ink/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-edge flex h-[68px] items-center justify-between md:h-[76px]">
        <a href="#top" aria-label="Taste Garden" className="relative z-10">
          <Logo priority width={scrolled ? 104 : 118} className="transition-all duration-500" />
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className="group relative text-[0.86rem] font-medium text-cream/75 transition-colors duration-300 hover:text-cream"
            >
              {t(l.id)}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ember transition-all duration-300 ease-smooth group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <a
            href="#reservation"
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-[0.86rem] font-medium text-cream transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-crimson-bright"
          >
            {t('reserve')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-white/[0.03] text-cream md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-2xl transition-all duration-500 ease-smooth md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="container-edge flex h-[68px] items-center justify-between">
          <Logo width={104} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Sluiten"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-white/[0.03] text-cream"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <nav className="container-edge mt-6 flex flex-1 flex-col justify-center gap-1">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-cream/10 py-4 font-display text-3xl text-cream transition-colors duration-300 hover:text-ember"
              style={{
                transform: open ? 'translateY(0)' : 'translateY(16px)',
                opacity: open ? 1 : 0,
                transition: `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.08 * i + 0.1}s, opacity 0.5s ease ${0.08 * i + 0.1}s`,
              }}
            >
              <span className="font-sans text-xs text-ember/70">0{i + 1}</span>
              {t(l.id)}
            </a>
          ))}
        </nav>

        <div className="container-edge flex items-center justify-between pb-10 pt-6">
          <LanguageSwitcher />
          <a
            href="#reservation"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-medium text-cream"
          >
            {t('reserve')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
