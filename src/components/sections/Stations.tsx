'use client';

import { useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import teppanyaki from '../../../public/images/teppanyaki.png';
import wok from '../../../public/images/wok.jpg';
import sushi from '../../../public/images/table-2.jpg';
import dessert from '../../../public/images/dessert.jpg';

type Station = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
};

const IMAGES: Record<string, StaticImageData> = { teppanyaki, wok, sushi, dessert };

export function Stations() {
  const t = useTranslations('stations');
  const items = t.raw('items') as Station[];
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const imgs = gsap.utils.toArray<HTMLElement>('[data-st-img]');
      const texts = gsap.utils.toArray<HTMLElement>('[data-st-text]');
      const rail = gsap.utils.toArray<HTMLElement>('[data-st-rail]');
      const bar = root.current?.querySelector<HTMLElement>('[data-st-bar]');
      const n = items.length;

      gsap.set(imgs, { opacity: 0, scale: 1.08 });
      gsap.set(imgs[0], { opacity: 1, scale: 1 });
      gsap.set(texts, { opacity: 0, y: 28 });
      gsap.set(texts[0], { opacity: 1, y: 0 });
      rail[0]?.classList.add('is-active');

      let cur = 0;

      const goTo = (idx: number) => {
        if (idx === cur) return;
        gsap.to(imgs[cur], { opacity: 0, scale: 1.08, duration: 0.7, ease: 'power2.out' });
        gsap.to(texts[cur], { opacity: 0, y: -22, duration: 0.45, ease: 'power2.in' });
        gsap.fromTo(
          imgs[idx],
          { opacity: 0, scale: 1.1 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
        );
        gsap.fromTo(
          texts[idx],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.08 },
        );
        rail.forEach((r, i) => r.classList.toggle('is-active', i === idx));
        cur = idx;
      };

      const trigger = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          const idx = Math.min(n - 1, Math.floor(self.progress * n * 0.9999));
          goTo(idx);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="stations" className="scroll-mt-24">
      {/* Heading */}
      <div className="container-edge pt-24 md:pt-32">
        <div className="max-w-2xl">
          <p data-reveal className="eyebrow mb-5">
            {t('eyebrow')}
          </p>
          <h2
            data-reveal
            className="font-display text-4xl leading-tight text-cream sm:text-5xl md:text-6xl"
          >
            {t('title')}
          </h2>
          <p data-reveal className="mt-6 max-w-xl text-base leading-relaxed text-cream/70">
            {t('intro')}
          </p>
        </div>
      </div>

      {/* Immersive scroll-driven stage */}
      <div
        ref={stageRef}
        className="motion-only relative mt-12"
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Image layers */}
          {items.map((s) => (
            <div key={s.id} data-st-img className="absolute inset-0">
              <Image
                src={IMAGES[s.id]}
                alt={s.name}
                fill
                sizes="100vw"
                className="object-cover object-center"
                placeholder="blur"
              />
              <div className="absolute inset-0 bg-ink/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
            </div>
          ))}

          {/* Rail (desktop) */}
          <div className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
            {items.map((s) => (
              <div
                key={s.id}
                data-st-rail
                className="station-rail flex items-center gap-3 text-sm text-cream/40 transition-colors duration-500"
              >
                <span className="font-mono text-xs tabular">{s.index}</span>
                <span className="station-rail-line h-px w-7 bg-cream/20 transition-all duration-500" />
                <span className="station-rail-name font-medium">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Text layers */}
          <div className="container-edge relative flex h-full items-end pb-24 md:items-center md:pb-0">
            <div className="relative w-full max-w-xl">
              {items.map((s) => (
                <div
                  key={s.id}
                  data-st-text
                  className="absolute bottom-0 left-0 w-full md:bottom-auto md:top-1/2 md:-translate-y-1/2"
                >
                  <span className="font-mono text-sm tabular text-ember">{s.index}</span>
                  <h3 className="mt-3 font-display text-5xl text-cream sm:text-6xl md:text-7xl">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-lg font-medium text-ember/90">{s.tagline}</p>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-cream/75">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-cream/10">
            <div
              data-st-bar
              className="h-full origin-left bg-crimson"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>
      </div>

      {/* Reduced-motion / no-JS fallback */}
      <div className="reduce-only container-edge mt-12 grid gap-5 sm:grid-cols-2">
        {items.map((s) => (
          <article
            key={s.id}
            className="group relative overflow-hidden rounded-3xl border border-cream/10"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={IMAGES[s.id]}
                alt={s.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                placeholder="blur"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-mono text-sm tabular text-ember">{s.index}</span>
              <h3 className="mt-1 font-display text-3xl text-cream">{s.name}</h3>
              <p className="mt-1 text-sm font-medium text-ember/90">{s.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
