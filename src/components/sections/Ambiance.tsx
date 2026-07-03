'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import { useTheme } from '@/lib/useTheme';
import sfeerInterior from '../../../public/images/ambiance/sfeer-interior.png';

export function Ambiance() {
  const t = useTranslations('ambiance');
  const isLight = useTheme() === 'light';
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.fromTo(
        '[data-amb-bg]',
        { yPercent: -4, scale: 1.035 },
        {
          yPercent: 4,
          scale: 1.015,
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
      data-theme={isLight ? undefined : 'dark'}
      className="relative isolate min-h-[760px] overflow-hidden bg-ink transition-colors duration-500 sm:min-h-[840px] md:flex md:min-h-[760px] md:items-center lg:min-h-[820px]"
    >
      <div
        data-amb-bg
        className="absolute inset-x-0 -inset-y-[5%] z-0 will-change-transform"
      >
        <Image
          src={sfeerInterior}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover object-[62%_center] transition-[filter] duration-700 sm:object-[58%_center] md:object-center ${
            isLight ? 'brightness-[1.08] contrast-[0.92] saturate-[0.96]' : 'brightness-[0.92] contrast-[1.02] saturate-[1.02]'
          }`}
        />
      </div>

      {isLight ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-[1] hidden bg-[linear-gradient(90deg,#fbf5ec_0%,rgba(251,245,236,0.95)_24%,rgba(251,245,236,0.68)_46%,rgba(251,245,236,0.18)_67%,transparent_86%)] md:block" />
          <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[linear-gradient(180deg,#fbf5ec_0%,transparent_18%,transparent_76%,#fbf5ec_100%)] md:block" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(20,16,14,0.16)_0%,rgba(20,16,14,0.18)_34%,rgba(20,16,14,0.66)_68%,rgba(20,16,14,0.88)_100%)] md:hidden" />
        </>
      ) : (
        <>
          {/* Keep the real interior visible; only the copy side and section edges fade into ink. */}
          <div className="pointer-events-none absolute inset-0 z-[1] hidden bg-[linear-gradient(90deg,#14100e_0%,rgba(20,16,14,0.98)_20%,rgba(20,16,14,0.84)_40%,rgba(20,16,14,0.28)_62%,transparent_82%)] md:block" />
          <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[linear-gradient(180deg,#14100e_0%,transparent_18%,transparent_78%,#14100e_100%)] md:block" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(20,16,14,0.08)_0%,rgba(20,16,14,0.14)_34%,rgba(20,16,14,0.7)_68%,rgba(20,16,14,0.92)_100%)] md:hidden" />
        </>
      )}

      <div className="container-edge relative z-10 flex min-h-[760px] items-end pb-16 pt-28 sm:min-h-[840px] sm:pb-20 md:block md:min-h-0 md:py-28">
        <div className="relative max-w-[42rem] rounded-[1.75rem] border border-cream/10 border-l-ember/75 bg-ink/45 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-[2px] sm:p-7 md:max-w-[41rem] md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent md:py-0 md:pl-12 md:shadow-none md:backdrop-blur-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-1 top-[-5.2rem] font-display text-[8.5rem] leading-none text-ember/[0.13] sm:top-[-6rem] sm:text-[10rem] md:-left-2 md:top-[-7.5rem] md:text-[12rem]"
          >
            “
          </span>

          <SectionEmblem variant="ambiance" reveal={false} className="mb-2" />
          <p className="eyebrow mb-7">
            {t('eyebrow')}
          </p>

          <blockquote
            className="max-w-[18ch] text-balance font-display text-[2.15rem] leading-[1.04] text-cream sm:text-[3rem] md:text-[3.28rem] lg:text-[3.55rem]"
          >
            {t('quote')}
          </blockquote>

          <div className="mt-7 flex items-center gap-3 md:mt-8">
            <span className="h-px w-12 bg-ember/80" />
            <span className="h-1 w-1 rotate-45 bg-ember" />
          </div>

          <p
            className="mt-6 max-w-[38rem] text-[0.98rem] leading-[1.72] text-cream/72 sm:text-base md:mt-7 md:text-[1.04rem]"
          >
            {t('body')}
          </p>
        </div>
      </div>
    </section>
  );
}
