'use client';

import type { CSSProperties } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import teppanyakiPhoto from '../../../public/images/kitchens/teppanyaki-meat-scene-v1.webp';
import wokPhoto from '../../../public/images/kitchens/wok-scene-v2.webp';
import sushiPhoto from '../../../public/images/kitchens/sushi-buffet-scene-v1.png';
import dessertPhoto from '../../../public/images/kitchens/dessert-buffet-scene-v1.png';
import coldStartersPhoto from '../../../public/images/kitchens/cold-starters-scene-v1.webp';
import warmStartersPhoto from '../../../public/images/kitchens/warm-starters-scene-v1.webp';
import warmMainsPhoto from '../../../public/images/kitchens/warm-mains-scene-v1.webp';
import warmSidesPhoto from '../../../public/images/kitchens/warm-sides-scene-v1.webp';
import drinksBarPhoto from '../../../public/images/kitchens/drinks-bar-scene-v1.webp';
import teppanyakiObject from '../../../public/images/kitchens/teppanyaki-object.webp';
import wokObject from '../../../public/images/kitchens/wok-object.webp';
import sushiObject from '../../../public/images/kitchens/sushi-object.webp';
import dessertObject from '../../../public/images/kitchens/dessert-object.webp';
import coldStartersObject from '../../../public/images/kitchens/cold-starters-object.webp';
import warmStartersObject from '../../../public/images/kitchens/warm-starters-object.webp';
import warmMainsObject from '../../../public/images/kitchens/warm-mains-object.webp';
import warmSidesObject from '../../../public/images/kitchens/warm-sides-object.webp';
import drinksBarObject from '../../../public/images/kitchens/drinks-bar-object.webp';

const STATION_IDS = [
  'teppanyaki',
  'wok',
  'sushi',
  'dessert',
  'cold-starters',
  'warm-starters',
  'warm-mains',
  'warm-sides',
  'drinks-bar',
] as const;

type StationId = (typeof STATION_IDS)[number];

type Station = {
  id: StationId;
  index: string;
  name: string;
  tagline: string;
  description: string;
};

type KitchenTheme = {
  photo: StaticImageData;
  object: StaticImageData;
  accent: string;
  accentLight: string;
  photoPosition: string;
  objectClass: string;
  objectPosition: string;
  reverse: boolean;
};

const STATION_THEMES = {
  teppanyaki: {
    photo: teppanyakiPhoto,
    object: teppanyakiObject,
    accent: '#E2A03B',
    accentLight: '#9A6516',
    photoPosition: '50% 52%',
    objectClass: 'w-[58%] max-w-[280px] lg:w-[48%] lg:max-w-[390px]',
    objectPosition: 'right-[-5%] bottom-[-12%] lg:right-[-15%] lg:bottom-[-16%]',
    reverse: false,
  },
  wok: {
    photo: wokPhoto,
    object: wokObject,
    accent: '#D86A38',
    accentLight: '#A8431A',
    photoPosition: '48% 52%',
    objectClass: 'w-[57%] max-w-[285px] lg:w-[48%] lg:max-w-[390px]',
    objectPosition: 'left-[-7%] bottom-[-12%] lg:left-[-17%] lg:bottom-[-17%]',
    reverse: true,
  },
  sushi: {
    photo: sushiPhoto,
    object: sushiObject,
    accent: '#D7B069',
    accentLight: '#8F6B1E',
    photoPosition: '54% 56%',
    objectClass: 'w-[68%] max-w-[330px] lg:w-[58%] lg:max-w-[470px]',
    objectPosition: 'right-[-10%] bottom-[-8%] lg:right-[-22%] lg:bottom-[-10%]',
    reverse: false,
  },
  dessert: {
    photo: dessertPhoto,
    object: dessertObject,
    accent: '#DEC28C',
    accentLight: '#8A6A2A',
    photoPosition: '50% 52%',
    objectClass: 'w-[49%] max-w-[235px] lg:w-[42%] lg:max-w-[340px]',
    objectPosition: 'left-[-3%] bottom-[-9%] lg:left-[-13%] lg:bottom-[-15%]',
    reverse: true,
  },
  'cold-starters': {
    photo: coldStartersPhoto,
    object: coldStartersObject,
    accent: '#B8D6D1',
    accentLight: '#51736F',
    photoPosition: '50% 52%',
    objectClass: 'w-[70%] max-w-[340px] lg:w-[60%] lg:max-w-[500px]',
    objectPosition: 'right-[-12%] bottom-[-10%] lg:right-[-20%] lg:bottom-[-13%]',
    reverse: false,
  },
  'warm-starters': {
    photo: warmStartersPhoto,
    object: warmStartersObject,
    accent: '#E3A74D',
    accentLight: '#8E5C12',
    photoPosition: '44% 54%',
    objectClass: 'w-[54%] max-w-[270px] lg:w-[44%] lg:max-w-[360px]',
    objectPosition: 'left-[-5%] bottom-[-10%] lg:left-[-14%] lg:bottom-[-14%]',
    reverse: true,
  },
  'warm-mains': {
    photo: warmMainsPhoto,
    object: warmMainsObject,
    accent: '#D88447',
    accentLight: '#8D461F',
    photoPosition: '50% 54%',
    objectClass: 'w-[66%] max-w-[330px] lg:w-[54%] lg:max-w-[440px]',
    objectPosition: 'right-[-8%] bottom-[-11%] lg:right-[-18%] lg:bottom-[-15%]',
    reverse: false,
  },
  'warm-sides': {
    photo: warmSidesPhoto,
    object: warmSidesObject,
    accent: '#C9B06A',
    accentLight: '#765F19',
    photoPosition: '42% 56%',
    objectClass: 'w-[60%] max-w-[300px] lg:w-[48%] lg:max-w-[390px]',
    objectPosition: 'left-[-7%] bottom-[-11%] lg:left-[-16%] lg:bottom-[-15%]',
    reverse: true,
  },
  'drinks-bar': {
    photo: drinksBarPhoto,
    object: drinksBarObject,
    accent: '#E1B46A',
    accentLight: '#856119',
    photoPosition: '56% 52%',
    objectClass: 'w-[54%] max-w-[275px] lg:w-[46%] lg:max-w-[380px]',
    objectPosition: 'right-[-5%] bottom-[-10%] lg:right-[-13%] lg:bottom-[-14%]',
    reverse: false,
  },
} satisfies Record<StationId, KitchenTheme>;

const stationIdSet: ReadonlySet<string> = new Set(STATION_IDS);

function parseStations(value: unknown): Station[] {
  if (!Array.isArray(value)) {
    throw new Error('Stations translations must be an array.');
  }

  const stations = value.map((item, index) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Station).id !== 'string' ||
      !stationIdSet.has((item as Station).id) ||
      typeof (item as Station).index !== 'string' ||
      typeof (item as Station).name !== 'string' ||
      typeof (item as Station).tagline !== 'string' ||
      typeof (item as Station).description !== 'string'
    ) {
      throw new Error(`Invalid station translation at index ${index}.`);
    }

    return item as Station;
  });

  const seen = new Set(stations.map((station) => station.id));
  if (seen.size !== stations.length) {
    throw new Error('Station translations contain duplicate station ids.');
  }

  const missing = STATION_IDS.filter((id) => !seen.has(id));

  if (missing.length > 0) {
    throw new Error(`Missing station translations: ${missing.join(', ')}.`);
  }

  return stations;
}

function KitchenScene({ station }: { station: Station }) {
  const theme = STATION_THEMES[station.id];
  // Expose both hues; globals.css picks the right one per data-theme (flash-free,
  // dark theme keeps its original accent).
  const style = {
    '--kitchen-accent-dark': theme.accent,
    '--kitchen-accent-light': theme.accentLight,
  } as CSSProperties;

  return (
    <article
      data-kitchen-scene
      data-reveal
      style={style}
      className="relative isolate grid items-center gap-10 py-14 sm:py-20 lg:min-h-[580px] lg:grid-cols-12 lg:gap-12 lg:py-24"
    >
      <div
        className={`relative lg:col-span-7 ${
          theme.reverse ? 'lg:col-start-6 lg:row-start-1' : 'lg:col-start-1'
        }`}
      >
        <div className="relative aspect-[16/11] overflow-hidden rounded-[30px] shadow-[0_34px_110px_-62px_rgba(0,0,0,0.95)] sm:aspect-[16/10] lg:aspect-[16/11]">
          <Image
            src={theme.photo}
            alt={station.name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="appetite object-cover"
            style={{ objectPosition: theme.photoPosition }}
            placeholder="blur"
          />
          <div className="kitchen-photo-scrim absolute inset-0" />
          <div
            className={`absolute inset-y-0 w-36 ${
              theme.reverse
                ? 'left-0 kitchen-edge-scrim-left'
                : 'right-0 kitchen-edge-scrim-right'
            }`}
          />
          <div className="kitchen-photo-vignette absolute inset-0" />
        </div>

        <div
          className={`pointer-events-none absolute z-20 ${theme.objectPosition} ${theme.objectClass}`}
        >
          <Image
            src={theme.object}
            alt=""
            sizes="(max-width: 1024px) 64vw, 34vw"
            className="h-auto w-full object-contain drop-shadow-[0_30px_28px_rgba(0,0,0,0.58)]"
          />
        </div>
      </div>

      <div
        className={`relative z-30 px-1 lg:col-span-4 lg:px-0 ${
          theme.reverse ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-9'
        }`}
      >
        <div className="mb-6 flex items-center gap-4">
          <span className="font-display text-4xl text-[color:var(--kitchen-accent)]">
            {station.index}
          </span>
          <span className="h-px w-12 bg-[color:var(--kitchen-accent)] opacity-55" />
        </div>
        <h3 className="font-display text-4xl leading-none text-cream sm:text-5xl lg:text-[3.35rem]">
          {station.name}
        </h3>
        <p className="mt-4 text-xs font-semibold uppercase leading-relaxed tracking-[0.2em] text-[color:var(--kitchen-accent)]">
          {station.tagline}
        </p>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/68 lg:max-w-sm">
          {station.description}
        </p>
      </div>
    </article>
  );
}

export function Stations() {
  const t = useTranslations('stations');
  const items = parseStations(t.raw('items'));

  return (
    <section
      id="stations"
      className="relative isolate -mt-px scroll-mt-28 pb-16 pt-20 md:pb-24 md:pt-28"
    >
      <div className="container-edge">
        <header className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
          <SectionEmblem variant="kitchens" align="center" className="mb-3" />
          <p data-reveal className="eyebrow mb-5 justify-center">
            {t('eyebrow')}
          </p>
          <h2
            data-reveal
            className="text-balance font-display text-4xl leading-[1.04] text-cream sm:text-5xl md:text-6xl"
          >
            {t('title')}
          </h2>
          <p
            data-reveal
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/68 md:text-lg"
          >
            {t('intro')}
          </p>
        </header>

        <div>
          {items.map((station) => (
            <KitchenScene key={station.id} station={station} />
          ))}
        </div>
      </div>
    </section>
  );
}
