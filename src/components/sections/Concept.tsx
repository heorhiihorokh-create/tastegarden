'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import teppanyaki from '../../../public/images/teppanyaki.png';

type Stat = { value: number; suffix: string; label: string };

export function Concept() {
  const t = useTranslations('concept');
  const stats = t.raw('stats') as Stat[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      gsap.to('[data-concept-img]', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-concept-band]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="concept" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="container-edge">
        <div className="mx-auto max-w-3xl text-center">
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
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 md:mt-20"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center px-2 text-center"
            >
              {i > 0 && (
                <span className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-cream/10 sm:block" />
              )}
              <span className="font-display text-4xl tabular text-ember sm:text-5xl md:text-6xl">
                {s.value}
                {s.suffix}
              </span>
              <span className="mt-3 text-xs leading-snug text-cream/70 sm:text-sm">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic band */}
      <div
        data-concept-band
        className="relative mt-20 h-[42vh] overflow-hidden md:mt-28 md:h-[56vh]"
      >
        <div data-concept-img className="absolute inset-0 -top-[12%] h-[124%]">
          <Image
            src={teppanyaki}
            alt="Teppanyaki wagyu"
            fill
            sizes="100vw"
            className="appetite object-cover object-center"
            placeholder="blur"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
        <div className="absolute inset-0 bg-ink/20" />
      </div>
    </section>
  );
}
