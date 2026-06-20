'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, MapPin, Phone, ArrowRight } from '@/components/ui/Icons';

type Hour = { day: string; value: string };

// JS weekday (0=Sun..6=Sat) -> grouped hours row index used in the i18n list.
const dayToRow: Record<number, number> = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 0: 3 };

// Opening ranges in minutes-from-midnight, keyed by JS weekday. Monday closed.
const schedule: Record<number, [number, number][]> = {
  0: [[690, 960], [1080, 1320]], // Sun 11:30–16:00 · 18:00–22:00
  1: [],
  2: [[690, 870], [1080, 1320]], // Tue–Thu 11:30–14:30 · 18:00–22:00
  3: [[690, 870], [1080, 1320]],
  4: [[690, 870], [1080, 1320]],
  5: [[690, 870], [1080, 1380]], // Fri–Sat 11:30–14:30 · 18:00–23:00
  6: [[690, 870], [1080, 1380]],
};

export function Practical() {
  const t = useTranslations('practical');
  const hours = t.raw('hours') as Hour[];
  const [todayRow, setTodayRow] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    const now = new Date();
    setTodayRow(dayToRow[now.getDay()]);
    const mins = now.getHours() * 60 + now.getMinutes();
    const ranges = schedule[now.getDay()] || [];
    setOpenNow(ranges.some(([a, b]) => mins >= a && mins < b));
  }, []);

  const mapSrc =
    'https://www.google.com/maps?q=Kortrijksestraat+276,+8870+Izegem,+België&z=15&output=embed';

  return (
    <section id="practical" className="scroll-mt-28 py-24 md:py-32">
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

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Opening hours */}
          <div data-reveal className="glass rounded-3xl p-7 md:p-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-ember" />
                <h3 className="text-xs uppercase tracking-eyebrow text-ember">{t('hoursTitle')}</h3>
              </div>
              {openNow !== null && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    openNow ? 'bg-emerald-500/15 text-emerald-300' : 'bg-crimson/15 text-crimson-bright'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${openNow ? 'bg-emerald-400' : 'bg-crimson-bright'}`} />
                  {openNow ? t('openNow') : t('closedNow')}
                </span>
              )}
            </div>

            <ul className="divide-y divide-cream/10">
              {hours.map((h, i) => {
                const active = todayRow === i;
                return (
                  <li
                    key={h.day}
                    className={`flex items-center justify-between gap-4 rounded-xl px-3 py-3.5 transition-colors ${
                      active ? 'bg-crimson/10' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`text-[0.95rem] font-medium ${active ? 'text-cream' : 'text-cream/80'}`}>
                        {h.day}
                      </span>
                      {active && (
                        <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-ember">
                          {t('today')}
                        </span>
                      )}
                    </span>
                    <span className={`tabular text-right text-sm ${active ? 'text-ember' : 'text-cream/65'}`}>
                      {h.value}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-cream/60">{t('hoursNote')}</p>
          </div>

          {/* Address + contact + map */}
          <div data-reveal className="glass flex flex-col overflow-hidden rounded-3xl">
            <div className="grid gap-6 p-7 sm:grid-cols-2 md:p-9">
              <div className="flex flex-col">
                <MapPin className="h-5 w-5 text-ember" />
                <h3 className="mt-4 text-xs uppercase tracking-eyebrow text-ember">{t('addressTitle')}</h3>
                <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-cream/85">
                  {t('address')}
                </p>
                <a
                  href="https://maps.google.com/?q=Kortrijksestraat+276+8870+Izegem"
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-cream transition-colors hover:text-ember"
                >
                  {t('directions')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div className="flex flex-col">
                <Phone className="h-5 w-5 text-ember" />
                <h3 className="mt-4 text-xs uppercase tracking-eyebrow text-ember">{t('contactTitle')}</h3>
                <a href="tel:+3251303888" className="mt-3 block tabular text-[0.95rem] text-cream/85 transition-colors hover:text-ember">
                  {t('phone1')}
                </a>
                <a href="tel:+32460973088" className="mt-1 block tabular text-[0.95rem] text-cream/85 transition-colors hover:text-ember">
                  {t('phone2')}
                </a>
                <a
                  href="tel:+3251303888"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-crimson px-4 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright"
                >
                  <Phone className="h-4 w-4" />
                  {t('call')}
                </a>
              </div>
            </div>

            <div className="relative mt-auto">
              <iframe
                src={mapSrc}
                title="Taste Garden — Izegem"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[220px] w-full"
                style={{
                  border: 0,
                  filter: 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.92)',
                }}
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cream/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
