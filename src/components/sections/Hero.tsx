'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import { EmberCanvas } from '@/components/motion/EmberCanvas';
import { useTheme } from '@/lib/useTheme';
import lanterns from '../../../public/images/lanterns.jpg';

export function Hero() {
  const t = useTranslations('hero');
  const isLight = useTheme() === 'light';
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduce) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero-line] > span', {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.12,
        })
          .from(
            '[data-hero-fade]',
            { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 },
            '-=0.6',
          )
          .from('[data-hero-cue]', { opacity: 0, duration: 0.8 }, '-=0.3');

        // Parallax: background drifts up, content lifts & fades as you leave the hero.
        gsap.to('[data-hero-bg]', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
        gsap.to('[data-hero-content]', {
          y: -60,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      data-theme={isLight ? 'light' : 'dark'}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink"
    >
      {/* Background image + atmosphere */}
      <div data-hero-bg className="absolute inset-0 z-0 scale-110">
        <Image
          src={lanterns}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center transition-[filter] duration-700 ${
            isLight
              ? 'brightness-[0.94] contrast-[1.04] saturate-[0.9]'
              : ''
          }`}
          placeholder="blur"
        />
        {isLight ? (
          <>
            {/* Light theme keeps the page bright, but the hero photo stays rich enough for white editorial type. */}
            <div className="absolute inset-0 bg-[#fff6ec]/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120604]/68 via-[#120604]/28 to-[#120604]/4" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ef]/10 via-transparent to-[#fbf4eb]/42" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-ink/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-ink" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/45 to-transparent" />
          </>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <EmberCanvas />
      </div>

      <div data-hero-content className="container-edge relative isolate z-10 pt-28 pb-24">
        <p data-hero-fade className="eyebrow hero-eyebrow mb-6 tracking-[0.14em] sm:tracking-eyebrow">
          <span className="hero-eyebrow-line h-px w-7 shrink-0 bg-ember/60" />
          {t('eyebrow')}
        </p>

        <h1 className="font-display text-[clamp(2.35rem,7.8vw,6.25rem)] leading-[0.96] tracking-[-0.015em] text-cream">
          <span data-hero-line className="block overflow-hidden py-[0.04em]">
            <span className="hero-title-primary block whitespace-nowrap">{t('titleLine1')}</span>
          </span>
          <span data-hero-line className="block overflow-hidden py-[0.04em]">
            <span className="hero-title-accent block whitespace-nowrap italic text-ember">
              {t('titleLine2')}
            </span>
          </span>
        </h1>

        <p
          data-hero-fade
          className="hero-copy mt-7 max-w-xl text-base leading-relaxed text-cream/75 md:text-lg"
        >
          {t('subtitle')}
        </p>

        <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-3.5">
          <a
            href="#reservation"
            className="hero-primary-cta group inline-flex items-center gap-2.5 rounded-full bg-crimson px-7 py-4 text-[0.95rem] font-medium text-[#fff8ed] shadow-[0_22px_50px_-20px_rgba(193,39,45,0.95)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-crimson-bright"
          >
            {t('ctaPrimary')}
          </a>
          <a
            href="#formules"
            className="hero-secondary-cta inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-white/[0.03] px-7 py-4 text-[0.95rem] font-medium text-cream backdrop-blur-sm transition-all duration-300 ease-smooth hover:border-ember/60 hover:text-ember"
          >
            {t('ctaSecondary')}
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        data-hero-cue
        href="#concept"
        className="hero-scroll-cue absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/70 transition-colors hover:text-ember sm:flex"
        aria-label={t('skip')}
      >
        <span className="text-[0.66rem] font-medium uppercase tracking-eyebrow">
          {t('scroll')}
        </span>
        <span className="hero-scroll-frame flex h-9 w-5 items-start justify-center rounded-full border border-cream/25 p-1">
          <span className="hero-scroll-dot h-2 w-1 animate-scroll-cue rounded-full bg-ember" />
        </span>
      </a>
    </section>
  );
}
