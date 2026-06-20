'use client';

import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
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

  return (
    <section id="stations" className="scroll-mt-28 py-24 md:py-32">
      <div className="container-edge">
        <div className="mb-12 max-w-2xl md:mb-16">
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

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((s) => (
            <article
              key={s.id}
              data-reveal
              className="group overflow-hidden rounded-3xl border border-cream/10 bg-ink-soft transition-colors duration-500 hover:border-ember/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={IMAGES[s.id]}
                  alt={s.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.1s] ease-smooth group-hover:scale-105"
                  placeholder="blur"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-transparent to-transparent" />
                <span className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ember/40 bg-ink/60 font-mono text-sm tabular text-ember backdrop-blur-sm">
                  {s.index}
                </span>
              </div>
              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-2xl text-cream md:text-3xl">{s.name}</h3>
                  <span className="text-sm font-medium text-ember">{s.tagline}</span>
                </div>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-cream/70">
                  {s.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
