'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock, Phone } from '@/components/ui/Icons';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import { HolidayAnnouncementCard, type HolidaySeason } from '@/components/ui/HolidayAnnouncementCard';
import {
  buildReservationSlots,
  getBelgiumNow,
  getNextBookableDateIso,
  getReservationDayState,
  isServiceAvailableForDate,
  type Service,
} from '@/lib/openingSchedule';
import resvPanel from '../../../public/images/resv-panel.png';
import resvPanelLight from '../../../public/images/resv-panel-light.png';
import togglePlaque from '../../../public/images/resv-toggle.png';
import togglePlaqueLight from '../../../public/images/resv-button-light.png';
import { useTheme } from '@/lib/useTheme';
import {
  isDateInHolidayBlockWindow,
  type HolidayBlockWindow,
} from '@/lib/holidayBlockWindow';

type Status = 'idle' | 'sending' | 'success' | 'error';
type Values = {
  service: Service;
  date: string;
  time: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  message: string;
};

const initial: Values = {
  service: 'dinner',
  date: '',
  time: '',
  guests: '2',
  name: '',
  phone: '',
  email: '',
  message: '',
};

const reservationApi =
  process.env.NEXT_PUBLIC_RESERVATION_API_URL || '/api/reservation';
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

// --- Panel slot geometry (measured from resv-panel.png, 1073×1335, in %) ----
type Box = { left: number; top: number; width: number; height: number };
const SLOT: Record<string, Box> = {
  toggle: { left: 12, top: 14.0, width: 76, height: 5.5 },
  date: { left: 8.4, top: 23.4, width: 39.5, height: 6.2 },
  time: { left: 52, top: 23.4, width: 39.6, height: 6.2 },
  name: { left: 8.4, top: 33.3, width: 83.2, height: 6.0 },
  guests: { left: 8.4, top: 43.1, width: 39.5, height: 6.0 },
  phone: { left: 52, top: 43.1, width: 39.6, height: 6.0 },
  email: { left: 8.4, top: 52.9, width: 83.2, height: 6.1 },
  message: { left: 11, top: 64, width: 60, height: 14.5 },
  submit: { left: 3.7, top: 82.0, width: 92.4, height: 14.8 },
};
// Light-theme panel (resv-panel-light.png, 1073×1354) — measured from the clean green-matte cutout
const LIGHT_SLOT: Record<string, Box> = {
  toggle: { left: 12, top: 13.6, width: 76, height: 5.4 },
  date: { left: 8.4, top: 23.0, width: 39.6, height: 6.2 },
  time: { left: 52, top: 23.0, width: 39.5, height: 6.2 },
  name: { left: 8.4, top: 32.7, width: 83.1, height: 6.3 },
  guests: { left: 8.4, top: 42.4, width: 39.6, height: 6.3 },
  phone: { left: 52, top: 42.4, width: 39.5, height: 6.3 },
  email: { left: 8.4, top: 52.1, width: 83.2, height: 6.3 },
  message: { left: 11, top: 63.5, width: 60, height: 12.5 },
  submit: { left: 4, top: 85.3, width: 92, height: 9.4 },
};
const pos = (b: Box): React.CSSProperties => ({
  left: `${b.left}%`,
  top: `${b.top}%`,
  width: `${b.width}%`,
  height: `${b.height}%`,
});

export function Reservation({
  bookingsClosed = false,
  closedMessage = '',
  holiday,
}: {
  bookingsClosed?: boolean;
  closedMessage?: string;
  holiday?: {
    active: boolean;
    blocksReservations?: boolean;
    blockWindow?: HolidayBlockWindow;
    theme: HolidaySeason;
    title: string;
    message: string;
  };
}) {
  const t = useTranslations('reservation');
  const locale = useLocale();
  const f = useTranslations('reservation.form');
  const theme = useTheme();
  const isLight = theme === 'light';
  const SL = isLight ? LIGHT_SLOT : SLOT;
  const rules = t.raw('rules') as string[];
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [hp, setHp] = useState(''); // honeypot
  const [today, setToday] = useState<{ iso: string; min: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof Values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  // Resolve Belgian "now" on the client only (avoids SSR/hydration drift);
  // default to the next bookable date so Monday/closed days do not look broken.
  useEffect(() => {
    const now = getBelgiumNow();
    const nextDate = getNextBookableDateIso(now.iso, undefined, now.minutes) || now.iso;
    const nextService: Service = isServiceAvailableForDate(nextDate, 'dinner') ? 'dinner' : 'lunch';

    setToday({ iso: now.iso, min: now.minutes });
    setValues((v) => (v.date ? v : { ...v, date: nextDate, service: nextService }));
  }, []);

  const dayState = useMemo(
    () => (values.date ? getReservationDayState(values.date) : null),
    [values.date],
  );
  const selectedDateBlocked = Boolean(
    holiday?.active &&
      holiday.blockWindow &&
      isDateInHolidayBlockWindow(values.date, holiday.blockWindow),
  );
  const lunchAvailable = !selectedDateBlocked && Boolean(dayState?.available.lunch);
  const dinnerAvailable = !selectedDateBlocked && Boolean(dayState?.available.dinner);
  const dayClosed = Boolean(dayState?.isClosed || selectedDateBlocked);
  const serviceAvailable = values.service === 'lunch' ? lunchAvailable : dinnerAvailable;

  const slots = useMemo(() => {
    if (!today || selectedDateBlocked) return [];
    return buildReservationSlots(
      values.date,
      values.service,
      values.date === today.iso,
      today.min,
    );
  }, [selectedDateBlocked, values.date, values.service, today]);

  // If a selected date does not offer the current service, choose the best valid
  // fallback. This makes Tue–Thu dinner-only feel intentional instead of broken.
  useEffect(() => {
    if (!values.date || serviceAvailable) return;

    const fallback: Service = dinnerAvailable ? 'dinner' : lunchAvailable ? 'lunch' : 'dinner';
    if (fallback !== values.service) {
      setValues((v) => ({ ...v, service: fallback, time: '' }));
    }
  }, [dinnerAvailable, lunchAvailable, serviceAvailable, values.date, values.service]);

  // Drop a chosen time that is no longer offered (day/service/now changed).
  useEffect(() => {
    if (values.time && !slots.includes(values.time)) {
      setValues((v) => ({ ...v, time: '' }));
    }
  }, [slots, values.time]);

  const validate = () => {
    const e: Partial<Record<keyof Values, string>> = {};
    (['date', 'time', 'name', 'phone', 'email'] as const).forEach((k) => {
      if (!values[k].trim()) e[k] = t('required');
    });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = t('invalidEmail');
    }
    if (values.date && (dayClosed || !serviceAvailable || !slots.includes(values.time))) {
      e.time = f('invalidTime');
    }
    return e;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setStatus('sending');
    if (demoMode) {
      window.setTimeout(() => setStatus('success'), 550);
      return;
    }
    try {
      const res = await fetch(reservationApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, company: hp }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  // Transparent control skinned onto a cream parchment slot
  const creamInput = (invalid?: boolean, extra = '') =>
    `h-full w-full rounded-[7px] bg-transparent text-[clamp(0.72rem,1.55vw,0.96rem)] text-[#3a241a] placeholder-[#7a5b45]/70 outline-none [color-scheme:light] ${extra} ${
      invalid ? 'shadow-[0_0_0_2px_rgba(193,39,45,0.75)]' : ''
    }`;
  const hasErrors = Object.keys(errors).length > 0;
  const scheduleAlert = selectedDateBlocked
    ? f('holidayBlockedDate')
    : dayState?.closedReason === 'after_monday_holiday'
    ? f('afterHolidayClosed')
    : dayClosed
      ? f('closedDay')
      : values.date && !serviceAvailable
        ? values.service === 'lunch'
          ? f('lunchUnavailable')
          : f('noTimes')
        : null;
  const holidayBlocksReservations = Boolean(holiday?.blocksReservations);
  const unavailableReason = holidayBlocksReservations ? 'holiday' : bookingsClosed ? 'manual' : null;
  const reservationsUnavailable = Boolean(unavailableReason);
  const unavailableBadge =
    unavailableReason === 'holiday' ? t('holidayClosedBadge') : t('closedBadge');
  const unavailableTitle =
    unavailableReason === 'holiday' ? t('holidayClosedTitle') : t('closedTitle');
  const unavailableBody =
    unavailableReason === 'holiday'
      ? t('holidayClosedBody')
      : closedMessage || t('closedBody');

  return (
    <section id="reservation" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-edge">
        {holiday?.active && (holiday.title || holiday.message) && (
          <HolidayAnnouncementCard
            reveal
            theme={holiday.theme}
            title={holiday.title}
            message={holiday.message}
            className="mb-10 md:mb-14"
          />
        )}

        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          {/* Intro */}
          <div className="lg:pt-6">
            <SectionEmblem variant="reservation" className="mb-3" />
            <p data-reveal className="eyebrow mb-5">
              {t('eyebrow')}
            </p>
            <h2
              data-reveal
              className="font-display text-4xl leading-tight text-cream sm:text-5xl md:text-6xl"
            >
              {t('title')}
            </h2>
            <p data-reveal className="mt-6 max-w-md text-base leading-relaxed text-cream/70">
              {t('intro')}
            </p>
            <div
              data-reveal
              className="reservation-info-card mt-6 max-w-md rounded-[1.35rem] px-4 py-4 md:px-5 md:py-5"
            >
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-ember">
                  <Clock className="h-3.5 w-3.5" />
                  {t('infoLabel')}
                </span>
                <p className="mt-2.5 font-display text-[1.75rem] leading-none text-cream sm:text-[2.15rem]">
                  {t('rulesTitle')}
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/78">
                  {rules[0]}
                </p>
                {rules[1] && (
                  <div className="reservation-info-holiday mt-3 rounded-2xl px-4 py-3">
                    <span className="mb-1 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ember">
                      {t('holidayLabel')}
                    </span>
                    <p className="text-sm leading-relaxed text-cream/76">
                      {rules[1]}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <a
              data-reveal
              href="tel:+3251303888"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-cream/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Phone className="h-[18px] w-[18px] text-ember" />
              {t('phoneCta')}
            </a>
          </div>

          {/* Form panel / success / unavailable */}
          <div data-reveal className="flex flex-col items-center">
            {reservationsUnavailable ? (
              <div className="glass mt-4 flex w-full max-w-[520px] flex-col items-center rounded-[28px] px-6 py-14 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-crimson/15 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-eyebrow text-crimson-bright">
                  <span className="h-1.5 w-1.5 rounded-full bg-crimson-bright" />
                  {unavailableBadge}
                </span>
                <h3 className="mt-5 font-display text-3xl text-cream">{unavailableTitle}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/75">
                  {unavailableBody}
                </p>
                <p className="mt-6 rounded-2xl border border-ember/20 bg-ember/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ember">
                  {t('closedHint')}
                </p>
              </div>
            ) : status === 'success' ? (
              <div className="glass mt-4 flex w-full max-w-[520px] flex-col items-center rounded-[28px] px-6 py-14 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ember/15">
                  <Check className="h-8 w-8 text-ember" />
                </span>
                <h3 className="mt-6 font-display text-3xl text-cream">{t('success.title')}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">
                  {t('success.body')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextDate = today
                      ? getNextBookableDateIso(today.iso, undefined, today.min) || today.iso
                      : '';
                    const nextService: Service =
                      nextDate && isServiceAvailableForDate(nextDate, 'dinner') ? 'dinner' : 'lunch';

                    setValues({ ...initial, date: nextDate, service: nextService });
                    setErrors({});
                    setStatus('idle');
                  }}
                  className="mt-7 text-sm font-medium text-ember underline-offset-4 hover:underline"
                >
                  {t('success.again')}
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`relative w-full max-w-[540px] ${
                    isLight ? 'aspect-[1073/1354]' : 'aspect-[1073/1335]'
                  }`}
                >
                  <Image
                    src={isLight ? resvPanelLight : resvPanel}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 92vw, 540px"
                    className="pointer-events-none select-none object-fill drop-shadow-[0_50px_70px_-50px_rgba(0,0,0,0.55)]"
                  />

                  <form
                    ref={formRef}
                    onSubmit={onSubmit}
                    noValidate
                    className="absolute inset-0 z-10"
                  >
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    />

                    {/* Lunch / Diner — sliding lacquer plaque in the top bar */}
                    <div
                      className="absolute"
                      style={pos(SL.toggle)}
                      role="radiogroup"
                      aria-label={f('service')}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-[2%] w-[44%] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{
                            transform:
                              values.service === 'dinner'
                                ? 'translateX(118.2%)'
                                : 'translateX(0%)',
                          }}
                        >
                          <Image
                            src={isLight ? togglePlaqueLight : togglePlaque}
                            alt=""
                            fill
                            sizes="240px"
                            className="select-none object-fill drop-shadow-[0_4px_10px_-3px_rgba(0,0,0,0.6)]"
                          />
                        </span>
                        <div className="relative z-10 grid h-full grid-cols-2">
                          {(['lunch', 'dinner'] as const).map((s) => {
                            const unavailable =
                              Boolean(values.date) && (s === 'lunch' ? !lunchAvailable : !dinnerAvailable);

                            return (
                              <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={values.service === s}
                                aria-disabled={unavailable}
                                disabled={unavailable}
                                onClick={() => set('service', s)}
                                className={`flex items-center justify-center font-display text-[clamp(0.82rem,1.7vw,1.08rem)] font-semibold tracking-wide transition-colors duration-300 disabled:cursor-not-allowed ${
                                  unavailable
                                    ? isLight
                                      ? 'text-[#9b856e]/45'
                                      : 'text-[#f4ece4]/30'
                                    : values.service === s
                                      ? isLight
                                        ? 'text-[#4a2c10] drop-shadow-[0_1px_1px_rgba(255,250,240,0.35)]'
                                        : 'text-[#f4ece4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                                      : isLight
                                        ? 'text-[#8a735b] hover:text-[#4a2c10]'
                                        : 'text-[#f4ece4]/55 hover:text-[#f4ece4]/80'
                                }`}
                              >
                                {f(s)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Date (calendar icon drawn on the panel) */}
                    <div className="absolute" style={pos(SL.date)}>
                      <input
                        type="date"
                        aria-label={f('date')}
                        aria-invalid={!!errors.date}
                        min={today?.iso}
                        value={values.date}
                        onChange={(e) => set('date', e.target.value)}
                        className={`resv-field px-[8%] text-center ${creamInput(
                          !!errors.date,
                        )}`}
                      />
                    </div>

                    {/* Time — fixed opening-hour slots (clock icon drawn on the panel) */}
                    <div className="absolute" style={pos(SL.time)}>
                      <select
                        aria-label={f('time')}
                        aria-invalid={!!errors.time}
                        value={values.time}
                        onChange={(e) => set('time', e.target.value)}
                        disabled={!values.date || dayClosed || !serviceAvailable || slots.length === 0}
                        className={`resv-field appearance-none px-[8%] text-center disabled:opacity-90 ${creamInput(
                          !!errors.time,
                        )}`}
                      >
                        <option value="">
                          {scheduleAlert
                            ? scheduleAlert
                            : !values.date
                              ? f('chooseDate')
                              : slots.length
                                ? f('chooseTime')
                                : f('noTimes')}
                        </option>
                        {slots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name */}
                    <div className="absolute px-[3%]" style={pos(SL.name)}>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder={f('name')}
                        aria-label={f('name')}
                        aria-invalid={!!errors.name}
                        value={values.name}
                        onChange={(e) => set('name', e.target.value)}
                        className={creamInput(!!errors.name, 'text-center font-medium')}
                      />
                    </div>

                    {/* Guests */}
                    <div className="absolute px-[2%]" style={pos(SL.guests)}>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        inputMode="numeric"
                        placeholder={f('guests')}
                        aria-label={f('guests')}
                        value={values.guests}
                        onChange={(e) => set('guests', e.target.value)}
                        className={creamInput(false, 'text-center')}
                      />
                    </div>

                    {/* Phone */}
                    <div className="absolute px-[2%]" style={pos(SL.phone)}>
                      <input
                        type="tel"
                        autoComplete="tel"
                        placeholder={f('phone')}
                        aria-label={f('phone')}
                        aria-invalid={!!errors.phone}
                        value={values.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        className={creamInput(!!errors.phone, 'text-center')}
                      />
                    </div>

                    {/* Email */}
                    <div className="absolute px-[3%]" style={pos(SL.email)}>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder={f('email')}
                        aria-label={f('email')}
                        aria-invalid={!!errors.email}
                        value={values.email}
                        onChange={(e) => set('email', e.target.value)}
                        className={creamInput(!!errors.email, 'text-center')}
                      />
                    </div>

                    {/* Comment — written over the landscape painting */}
                    <div className="absolute" style={pos(SL.message)}>
                      <textarea
                        rows={3}
                        placeholder={`${f('message')}…`}
                        aria-label={f('message')}
                        value={values.message}
                        onChange={(e) => set('message', e.target.value)}
                        className="h-full w-full resize-none bg-transparent text-left align-top text-[clamp(0.66rem,1.4vw,0.9rem)] leading-snug text-[#3a241a] placeholder-[#5c4636]/75 outline-none [text-shadow:0_1px_2px_rgba(244,236,228,0.55)]"
                      />
                    </div>

                    {/* Submit — overlays the lacquer bar (red in dark, beige in light) */}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      style={pos(SL.submit)}
                      className={`group absolute flex items-center justify-center rounded-[10px] font-display text-[clamp(0.95rem,2.1vw,1.25rem)] font-semibold tracking-[0.06em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${
                        isLight
                          ? 'text-[#5b3a1c] hover:text-[#3a2410]'
                          : 'text-[#f7e6c6] hover:text-white'
                      }`}
                    >
                      <span className="transition-transform duration-300 group-hover:scale-[1.04]">
                        {status === 'sending' ? f('sending') : f('submit')}
                      </span>
                    </button>
                  </form>
                </div>

                {/* Feedback below the panel */}
                {(hasErrors || status === 'error' || scheduleAlert) && (
                  <p role="alert" className="mt-4 max-w-[420px] text-center text-sm text-crimson-bright">
                    {status === 'error'
                      ? t('error')
                      : scheduleAlert
                        ? scheduleAlert
                        : errors.email && values.email
                          ? t('invalidEmail')
                          : t('required')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
