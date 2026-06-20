'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, MapPin, Phone, ArrowRight } from '@/components/ui/Icons';

type Hour = { day: string; value: string };

// Maps JS weekday (0=Sun..6=Sat) to the grouped hours row index.
const dayToRow: Record<number, number> = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 0: 3 };

export function Practical() {
  const t = useTranslations('practical');
  const hours = t.raw('hours') as Hour[];
  const [todayRow, setTodayRow] = useState<number | null>(null);

  useEffect(() => {
    setTodayRow(dayToRow[new Date().getDay()]);
  }, []);

  const mapSrc =
    'https://www.google.com/maps?q=Kortrijksestraat+276,+8870+Izegem,+België&z=15&output=embed';

  return (
    <section id="practical" className="scroll-mt-24 py-24 md:py-32">
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
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Opening hours */}
          <div data-reveal className="glass rounded-3xl p-7 md:p-8 lg:col-span-5">
            <div className="mb-6 flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-ember" />
              <h3 className="text-xs uppercase tracking-eyebrow text-ember">
                {t('hoursTitle')}
              </h3>
            </div>
            <ul>
              {hours.map((h, i) => {
                const active = todayRow === i;
                return (
                  <li
                    key={h.day}
                    className={`flex items-center justify-between gap-4 border-l-2 py-3.5 pl-4 transition-colors ${
                      active
                        ? 'border-crimson bg-crimson/5'
                        : 'border-transparent'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${active ? 'text-cream' : 'text-cream/75'}`}
                    >
                      {h.day}
                    </span>
                    <span
                      className={`tabular text-right text-sm ${
                        active ? 'text-ember' : 'text-cream/65'
                      }`}
                    >
                      {h.value}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-cream/60">{t('hoursNote')}</p>
          </div>

          {/* Address + contact + map */}
          <div className="grid gap-5 lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div data-reveal className="glass flex flex-col rounded-3xl p-7">
                <MapPin className="h-5 w-5 text-ember" />
                <h3 className="mt-4 text-xs uppercase tracking-eyebrow text-ember">
                  {t('addressTitle')}
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/80">
                  {t('address')}
                </p>
                <a
                  href="https://maps.google.com/?q=Kortrijksestraat+276+8870+Izegem"
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-cream transition-colors hover:text-ember"
                >
                  {t('directions')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div data-reveal className="glass flex flex-col rounded-3xl p-7">
                <Phone className="h-5 w-5 text-ember" />
                <h3 className="mt-4 text-xs uppercase tracking-eyebrow text-ember">
                  {t('contactTitle')}
                </h3>
                <div className="mt-3 space-y-2">
                  <a
                    href="tel:+3251303888"
                    className="block tabular text-sm text-cream/80 transition-colors hover:text-ember"
                  >
                    {t('phone1')}
                  </a>
                  <a
                    href="tel:+32460973088"
                    className="block tabular text-sm text-cream/80 transition-colors hover:text-ember"
                  >
                    {t('phone2')}
                  </a>
                </div>
                <a
                  href="tel:+3251303888"
                  className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5 pt-2.5 text-sm font-medium text-cream transition-colors hover:bg-white/[0.08]"
                >
                  <Phone className="h-4 w-4 text-ember" />
                  {t('call')}
                </a>
              </div>
            </div>

            <div
              data-reveal
              className="relative overflow-hidden rounded-3xl border border-cream/10"
            >
              <iframe
                src={mapSrc}
                title="Taste Garden — Izegem"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[260px] w-full"
                style={{
                  border: 0,
                  filter: 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.92)',
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-cream/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
