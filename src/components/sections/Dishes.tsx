'use client';

import { useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, useGSAP } from '@/lib/gsap';
import teppanyaki from '../../../public/images/teppanyaki.png';
import wok from '../../../public/images/wok.jpg';
import dessert from '../../../public/images/dessert.jpg';
import lanterns from '../../../public/images/lanterns.jpg';
import table1 from '../../../public/images/table-1.jpg';
import table2 from '../../../public/images/table-2.jpg';

type Tile = {
  img: StaticImageData;
  cap: number;
  span: string;
  ratio: string;
  speed?: number;
};

const tiles: Tile[] = [
  { img: teppanyaki, cap: 0, span: 'lg:col-span-7', ratio: 'aspect-[16/11]', speed: -30 },
  { img: dessert, cap: 3, span: 'lg:col-span-5', ratio: 'aspect-[4/5]', speed: 24 },
  { img: lanterns, cap: 4, span: 'lg:col-span-5', ratio: 'aspect-[5/4]', speed: -22 },
  { img: wok, cap: 1, span: 'lg:col-span-7', ratio: 'aspect-[16/10]', speed: 18 },
  { img: table2, cap: 2, span: 'lg:col-span-6', ratio: 'aspect-[3/2]', speed: -16 },
  { img: table1, cap: 5, span: 'lg:col-span-6', ratio: 'aspect-[3/2]', speed: 20 },
];

export function Dishes() {
  const t = useTranslations('dishes');
  const captions = t.raw('captions') as string[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(max-width: 1024px)').matches) return;

      gsap.utils.toArray<HTMLElement>('[data-tile]').forEach((tile) => {
        const speed = Number(tile.dataset.speed || 0);
        gsap.fromTo(
          tile.querySelector('[data-tile-inner]'),
          { y: -speed },
          {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: tile,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="dishes" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-edge">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
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
          </div>
          <p data-reveal className="max-w-sm text-base leading-relaxed text-cream/65">
            {t('intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {tiles.map((tile, i) => (
            <figure
              key={i}
              data-tile
              data-reveal
              data-speed={tile.speed}
              className={`group relative overflow-hidden rounded-3xl border border-cream/10 ${tile.span}`}
            >
              <div
                data-tile-inner
                className={`relative ${tile.ratio} w-full overflow-hidden`}
              >
                <Image
                  src={tile.img}
                  alt={captions[tile.cap]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="scale-[1.06] object-cover transition-transform duration-[1.2s] ease-smooth group-hover:scale-110"
                  placeholder="blur"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              </div>
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-5 md:p-6">
                <span className="h-px w-6 bg-ember transition-all duration-500 group-hover:w-10" />
                <span className="text-sm font-medium tracking-tight text-cream md:text-base">
                  {captions[tile.cap]}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
