'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, MapPin, Phone, Sun, Moon, Lock } from '@/components/ui/Icons';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import { getBelgiumNow, getOpeningWindowsForDate, getWeekday } from '@/lib/openingSchedule';
import { DEFAULT_SCHEDULE, buildWeeklyHoursRows, type ScheduleConfig } from '@/lib/scheduleConfig';
import { useTheme } from '@/lib/useTheme';

/** Build a dial-able tel: href from a displayed BE phone number (so edits actually call it). */
function telHref(display: string): string {
  let d = display.replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = `+${d.slice(2)}`;
  else if (d.startsWith('0')) d = `+32${d.slice(1)}`;
  return `tel:${d}`;
}

type FocusRule = { title: string; body: string; holidayLabel: string; holiday: string };

// One service window (lunch = sun, dinner = moon) rendered as a compact time chip.
function TimeChip({
  icon: Icon,
  time,
  label,
  active,
  locked = false,
  lockedLabel,
}: {
  icon: typeof Sun;
  time: string;
  label: string;
  active: boolean;
  locked?: boolean;
  lockedLabel?: string;
}) {
  return (
    <span
      aria-label={locked && lockedLabel ? `${label}: ${time} (${lockedLabel})` : `${label}: ${time}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[0.78rem] tabular transition-colors ${
        locked
          ? 'border-ember/20 bg-ember/[0.045] text-cream/50'
          : active
          ? 'border-ember/35 bg-ember/[0.12] text-cream'
          : 'border-cream/10 bg-cream/[0.04] text-cream/75'
      }`}
    >
      <Icon aria-hidden className={`h-3.5 w-3.5 shrink-0 ${locked ? 'text-ember/70' : active ? 'text-ember' : 'text-ember/80'}`} />
      {time}
    </span>
  );
}

export function Practical({ schedule = DEFAULT_SCHEDULE }: { schedule?: ScheduleConfig }) {
  const t = useTranslations('practical');
  const locale = useLocale();
  const theme = useTheme();
  const isLight = theme === 'light';
  const focusRule = t.raw('focusRule') as FocusRule;
  // Opening-hours list is derived 1:1 from the same schedule the booking form
  // uses, so admin edits show here immediately and can never drift.
  const hours = useMemo(() => buildWeeklyHoursRows(schedule, locale), [schedule, locale]);
  const [todayWeekday, setTodayWeekday] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    const now = getBelgiumNow();
    setTodayWeekday(getWeekday(now.iso));
    setOpenNow(
      Object.values(getOpeningWindowsForDate(now.iso, schedule)).some(
        ([start, end]) => now.minutes >= start && now.minutes < end,
      ),
    );
  }, [schedule]);

  const todayRow =
    todayWeekday === null ? -1 : hours.findIndex((row) => row.days.includes(todayWeekday));

  const mapSrc =
    'https://www.google.com/maps?q=Kortrijksestraat+276,+8870+Izegem,+België&z=15&output=embed';

  return (
    <section id="practical" className="scroll-mt-28 py-24 md:py-32">
      <div className="container-edge">
        <div className="mb-12 max-w-2xl md:mb-16">
          <SectionEmblem variant="practical" className="mb-3" />
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

        <div data-reveal className="policy-shell policy-notice mb-8 rounded-[1.35rem] p-3.5 md:mb-10 md:rounded-[1.45rem] md:p-5 lg:p-6">
          <div className="relative grid gap-4 md:grid-cols-[minmax(0,0.86fr)_minmax(19rem,0.62fr)] md:items-center">
            <article className="policy-rule-panel pl-4 md:pl-6">
              <p className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ember md:text-[0.68rem] md:tracking-[0.24em]">
                <Clock className="h-3.5 w-3.5" />
                {t('rulesTitle')}
              </p>
              <h3 className="mt-2.5 font-display text-[clamp(1.72rem,7vw,3rem)] leading-[1.02] text-cream md:mt-3">
                {focusRule.title}
              </h3>
              <p className="mt-2 max-w-[42rem] text-[0.94rem] leading-relaxed text-cream/80 md:text-[1.05rem]">
                {focusRule.body}
              </p>
            </article>

            <aside className="policy-note rounded-[1.1rem] px-3.5 py-3 md:rounded-2xl md:px-5 md:py-4">
              <span className="mb-1.5 inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-ember">
                <Moon className="h-3.5 w-3.5" />
                {focusRule.holidayLabel}
              </span>
              <p className="text-[0.92rem] leading-relaxed text-cream/76 md:text-[0.96rem]">
                {focusRule.holiday}
              </p>
            </aside>
          </div>
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

            <ul className="space-y-1.5">
              {hours.map((h, i) => {
                const active = todayRow === i;
                return (
                  <li
                    key={h.key}
                    className={`relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl px-3.5 py-3 transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-ember/[0.12] via-ember/[0.05] to-transparent'
                        : 'hover:bg-cream/[0.03]'
                    }`}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-ember"
                      />
                    )}
                    <span className="flex items-center gap-2.5">
                      <span className={`text-[0.95rem] font-medium ${active ? 'text-cream' : 'text-cream/85'}`}>
                        {h.label}
                      </span>
                      {active && (
                        <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ember">
                          {t('today')}
                        </span>
                      )}
                    </span>

                    <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {h.closed ? (
                        <span className="inline-flex items-center rounded-lg border border-cream/[0.08] bg-cream/[0.02] px-2.5 py-1 text-[0.78rem] font-medium text-cream/45">
                          {t('closed')}
                        </span>
                      ) : (
                        <>
                          {h.lunch && (
                            <TimeChip
                              icon={h.lunchReservable ? Sun : Lock}
                              time={h.lunch}
                              label={t('lunchLabel')}
                              active={active}
                              locked={!h.lunchReservable}
                              lockedLabel={t('notReservableLabel')}
                            />
                          )}
                          {h.dinner && (
                            <TimeChip
                              icon={h.dinnerReservable ? Moon : Lock}
                              time={h.dinner}
                              label={t('dinnerLabel')}
                              active={active}
                              locked={!h.dinnerReservable}
                              lockedLabel={t('notReservableLabel')}
                            />
                          )}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
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
                  className="group mt-2.5 self-start text-sm font-medium text-cream underline decoration-ember/45 decoration-1 underline-offset-[5px] transition-colors hover:text-ember hover:decoration-ember/80"
                >
                  {t('directions')}
                </a>
              </div>

              <div className="flex flex-col">
                <Phone className="h-5 w-5 text-ember" />
                <h3 className="mt-4 text-xs uppercase tracking-eyebrow text-ember">{t('contactTitle')}</h3>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/55">{t('callHint')}</p>
                <div className="mt-3.5 grid gap-2.5">
                  <a
                    href={telHref(t('phone1'))}
                    aria-label={`${t('call')} ${t('phone1')}`}
                    className="group flex items-center justify-center gap-2.5 rounded-full bg-crimson px-5 py-3 text-[0.95rem] font-semibold tabular text-[#f4ece4] transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright active:translate-y-0"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {t('phone1')}
                  </a>
                  <a
                    href={telHref(t('phone2'))}
                    aria-label={`${t('call')} ${t('phone2')}`}
                    className="group flex items-center justify-center gap-2.5 rounded-full border border-cream/20 bg-white/[0.03] px-5 py-3 text-[0.95rem] font-semibold tabular text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-ember/55 hover:text-ember active:translate-y-0"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-ember" />
                    {t('phone2')}
                  </a>
                </div>
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
                  filter: isLight
                    ? 'saturate(0.72) contrast(0.92) brightness(1.02)'
                    : 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.92)',
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
