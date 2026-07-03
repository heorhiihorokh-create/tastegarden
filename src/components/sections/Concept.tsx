'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import { SectionEmblem } from '@/components/ui/SectionEmblem';

type Stat = { value: number; suffix?: string; label: string };

export function Concept() {
  const t = useTranslations('concept');
  const stats = t.raw('stats') as Stat[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;

      const statItems = gsap.utils.toArray<HTMLElement>('[data-concept-stat]');
      gsap.set(statItems, { autoAlpha: 0, y: 18, filter: 'blur(8px)' });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '[data-concept-stats]',
          start: 'top 78%',
          once: true,
        },
      });

      statItems.forEach((item, index) => {
        const number = item.querySelector<HTMLElement>('[data-concept-number]');
        const target = Number(number?.dataset.value ?? 0);
        const suffix = number?.dataset.suffix ?? '';
        const counter = { value: 0 };
        const at = index * 0.13;

        tl.to(
          item,
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.75 },
          at,
        );

        if (!number) return;

        tl.to(
          counter,
          {
            value: target,
            duration: target > 20 ? 1.15 : 0.82,
            ease: 'power2.out',
            snap: { value: 1 },
            onStart: () => {
              number.textContent = `0${suffix}`;
            },
            onUpdate: () => {
              number.textContent = `${Math.round(counter.value)}${suffix}`;
            },
            onComplete: () => {
              number.textContent = `${target}${suffix}`;
            },
          },
          at + 0.05,
        );
      });

      gsap.fromTo(
        '[data-concept-divider-line]',
        { autoAlpha: 0.35, scaleX: 0.36 },
        {
          autoAlpha: 1,
          scaleX: 1,
          ease: 'power3.out',
          duration: 1.2,
          scrollTrigger: {
            trigger: '[data-concept-divider]',
            start: 'top 84%',
            once: true,
          },
        },
      );

      gsap.to('[data-concept-divider-seal]', {
        y: -7,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-concept-divider]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="concept"
      className="relative scroll-mt-24 overflow-hidden pb-16 pt-24 md:pb-20 md:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_center,rgb(var(--ember)/0.07),transparent_62%)]"
      />

      <div className="container-edge relative">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEmblem variant="concept" align="center" className="mb-3" />
          <p data-reveal className="eyebrow mb-6 justify-center">
            {t('eyebrow')}
          </p>
          <h2
            data-reveal
            className="text-balance font-display text-4xl leading-tight text-cream sm:text-5xl md:text-6xl"
          >
            {t('title')}
          </h2>
          <p
            data-reveal
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-cream/70 md:text-lg"
          >
            {t('body')}
          </p>
        </div>

        <div
          data-reveal
          data-concept-stats
          className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-y-8 md:mt-20 md:grid-cols-4"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              data-concept-stat
              className="relative flex min-h-[8.5rem] flex-col items-center justify-center px-3 text-center md:min-h-[7.75rem]"
            >
              {(i === 1 || i === 3) && (
                <span className="absolute left-0 top-1/2 h-14 w-px -translate-y-1/2 bg-cream/10 md:hidden" />
              )}
              {i >= 2 && (
                <span className="absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-cream/10 md:hidden" />
              )}
              {i > 0 && (
                <span className="absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-cream/10 md:block" />
              )}
              <span
                data-concept-number
                data-value={s.value}
                data-suffix={s.suffix ?? ''}
                className="font-display text-[3.25rem] leading-none tabular-nums text-ember sm:text-6xl md:text-[4.15rem]"
              >
                {s.value}
                {s.suffix}
              </span>
              <span className="mt-3 max-w-[10rem] text-xs font-medium leading-snug text-cream/68 sm:text-sm">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div
          data-reveal
          data-concept-divider
          aria-hidden="true"
          className="pointer-events-none relative mx-auto mt-10 h-24 max-w-5xl select-none md:mt-12 md:h-28"
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center gap-5 sm:gap-7">
            <span
              data-concept-divider-line
              className="h-px flex-1 origin-right bg-[linear-gradient(90deg,transparent_0%,rgb(var(--ember)/0.10)_12%,rgb(var(--ember)/0.42)_100%)]"
            />
            <span className="w-24 sm:w-36" />
            <span
              data-concept-divider-line
              className="h-px flex-1 origin-left bg-[linear-gradient(90deg,rgb(var(--ember)/0.42)_0%,rgb(var(--ember)/0.10)_88%,transparent_100%)]"
            />
          </div>

          <div className="absolute inset-x-[14%] top-[calc(50%+1.35rem)] h-px bg-[linear-gradient(90deg,transparent,rgb(var(--cream)/0.08),transparent)]" />
          <div className="absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(var(--ember)/0.13),transparent_68%)] blur-xl" />

          <svg
            data-concept-divider-seal
            viewBox="0 0 160 76"
            fill="none"
            className="absolute left-1/2 top-1/2 h-[4.75rem] w-40 -translate-x-1/2 -translate-y-1/2 overflow-visible text-ember"
          >
            <path
              d="M31 50.5C37 65 123 65 129 50.5"
              stroke="rgb(var(--cream) / 0.16)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M42 47.5h76"
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity="0.62"
              strokeWidth="1.5"
            />
            <path
              d="M50 48.5c3.5 11 56.5 11 60 0"
              fill="rgb(var(--ink-raise) / 0.72)"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="1.25"
            />
            <path
              d="M63 45.8c7.5-8.6 27-8.6 34.5 0"
              stroke="rgb(var(--cream) / 0.26)"
              strokeLinecap="round"
              strokeWidth="1.15"
            />
            <path
              d="M68.5 38.5c-5.2-6.2 2.6-8.3 0-14.2M80 38.5c-5.6-7 3.4-9.3 0-16.3M91.8 38.5c-5.2-6.2 2.6-8.3 0-14.2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity="0.5"
              strokeWidth="1.4"
            />
            <path
              d="M96.5 42.8c6.3-3.3 11.7-3.1 16.2.8M62.5 42.8c-6.3-3.3-11.7-3.1-16.2.8"
              stroke="rgb(var(--crimson) / 0.36)"
              strokeLinecap="round"
              strokeWidth="1.25"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
