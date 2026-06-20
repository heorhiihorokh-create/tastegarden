'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import dessert from '../../../public/images/dessert.jpg';

export function Ambiance() {
  const t = useTranslations('ambiance');
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(
        '[data-amb-bg]',
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="ambiance"
      className="relative flex min-h-[82vh] items-center overflow-hidden"
    >
      <div data-amb-bg className="absolute inset-0 -top-[12%] z-0 h-[124%]">
        <Image
          src={dessert}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/30 to-ink" />
      </div>

      <div className="container-edge relative z-10 py-24 text-center">
        <p data-reveal className="eyebrow mb-7 justify-center">
          {t('eyebrow')}
        </p>
        <blockquote
          data-reveal
          className="mx-auto max-w-4xl text-balance font-display text-3xl italic leading-[1.2] text-cream sm:text-4xl md:text-5xl lg:text-[3.4rem]"
        >
          “{t('quote')}”
        </blockquote>
        <p
          data-reveal
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-cream/65"
        >
          {t('body')}
        </p>
      </div>
    </section>
  );
}
