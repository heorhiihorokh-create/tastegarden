'use client';

import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, Flip, Moon, Sparkle, Sun } from '@/components/ui/Icons';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import { useTheme } from '@/lib/useTheme';
import eventBirthdayDark from '../../../public/images/menu/event-birthday-dark.webp';
import eventBirthdayLight from '../../../public/images/menu/event-birthday-light.webp';
import eventNewYearDark from '../../../public/images/menu/event-new-year-dark.webp';
import eventNewYearLight from '../../../public/images/menu/event-new-year-light.webp';
import formulaDinnerDark from '../../../public/images/menu/formula-dinner-dark.webp';
import formulaDinnerLight from '../../../public/images/menu/formula-dinner-light.webp';
import formulaLunchDark from '../../../public/images/menu/formula-lunch-dark.webp';
import formulaLunchLight from '../../../public/images/menu/formula-lunch-light.webp';

type Plan = {
  id: string;
  name: string;
  days: string;
  time: string;
  adults: number;
  kids: number;
  under5: number;
  kitchens: string[];
  featured?: boolean;
};

type Details = {
  flipHint: string;
  backTitle: string;
  kitchensTitle: string;
  drinksTitle: string;
  alaMinute: string;
  back: string;
};

type Special = {
  id: string;
  name: string;
  date: string;
  adults: number;
  kids: number;
  under5: number;
};

type Labels = Record<string, string>;

const NEW_YEAR_MENU = [
  'Aperitief Kirr Royal',
  'Voorgerecht aan tafel',
  '2 soorten soepen',
  'Koude voorgerechten',
  'Sushibar',
  'Warme voorgerechten',
  'Warme hoofdgerechten',
  'Warme bijgerechten',
  'Wok',
  'Teppanyaki',
  'Pizza',
  'Ijsbar',
  'fruitbar',
  'Dessertbuffet',
  'Drankbuffet inbegrepen tot 01u00',
];

const BIRTHDAY_MENU = [
  'Aperitief Maison',
  '2 soorten soepen',
  'Koude voorgerechten',
  'Sushibar',
  'Warme voorgerechten',
  'Warme hoofdgerechten',
  'Warme bijgerechten',
  'Wok',
  'Teppanyaki',
  'Pizza',
  'Dessertbuffet',
  'Ijsbar',
  'fruitbar',
  'Frisdranken, bier en wijnen van tap inbegrepen',
];

function formatDinnerTime(locale: string, date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'Europe/Brussels',
  }).format(date);
  const closesAt = weekday === 'Fri' || weekday === 'Sat' ? '23' : '22';

  if (locale === 'nl') return `18u00 – ${closesAt}u00`;
  if (locale === 'fr') return `18h00 – ${closesAt}h00`;
  return `18:00 – ${closesAt}:00`;
}

function useDinnerTime(locale: string, fallback: string) {
  const [time, setTime] = useState(fallback);

  useEffect(() => {
    setTime(formatDinnerTime(locale));
  }, [locale]);

  return time;
}

function HolidayTreePattern() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 240"
      fill="none"
      className="pointer-events-none absolute -bottom-8 -right-6 h-52 w-52 text-[#b58b52] opacity-[0.17] sm:h-56 sm:w-56"
    >
      <path
        d="m174 27 4.2 8.6 9.5 1.4-6.9 6.7 1.7 9.4-8.5-4.5-8.4 4.5 1.6-9.4-6.8-6.7 9.4-1.4 4.2-8.6Z"
        fill="currentColor"
        opacity=".42"
      />
      <path
        d="M174 54v120M174 62c-8.7 15.5-20.2 28.2-34.7 38.2h19.2c-10.8 16.4-24.7 30.2-41.7 41.3h30.4c-10.4 14.1-23.8 26.2-40.2 36.2h134c-16.4-10-29.8-22.1-40.2-36.2h30.4c-17-11.1-30.9-24.9-41.7-41.3h19.2C194.2 90.2 182.7 77.5 174 62Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M163 177h22v28h-22zM111 205h126" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M148 113h52M132 145h84M119 177h110"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 7"
        opacity=".7"
      />
      <circle cx="154" cy="104" r="3" fill="currentColor" />
      <circle cx="194" cy="126" r="2.5" fill="currentColor" />
      <circle cx="143" cy="153" r="2.5" fill="currentColor" />
      <circle cx="206" cy="162" r="3" fill="currentColor" />
      <path d="M215 72c7 2.6 11.5 7.1 14 13.5M222 61c5.2 1.8 8.7 5.2 10.5 10.3" stroke="currentColor" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

function BirthdayCakePattern() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 240"
      fill="none"
      className="pointer-events-none absolute -bottom-9 -right-7 h-52 w-52 text-ember opacity-[0.18] sm:h-56 sm:w-56"
    >
      <path
        d="M118 103h109v43H118zM99 146h141v48H99z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M118 118q8 9 16 0t16 0t16 0t16 0t16 0t16 0t13 0M99 161q10 10 20 0t20 0t20 0t20 0t20 0t20 0t21 0"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M138 103V76M172 103V68M207 103V78" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M138 70c-6-7-2-13 0-17 2 4 6 10 0 17ZM172 62c-6-7-2-13 0-18 2 5 6 11 0 18ZM207 72c-6-7-2-13 0-17 2 4 6 10 0 17Z"
        fill="currentColor"
        opacity=".6"
      />
      <path d="M83 194h163M116 207h101" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m99 65 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.5 2.9 1.1-6.1-4.5-4.3 6.2-.9L99 65ZM222 45l2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.6 2.4.9-5.1-3.7-3.6 5.1-.7 2.3-4.6Z" fill="currentColor" opacity=".55" />
      <circle cx="88" cy="104" r="2" fill="currentColor" opacity=".55" />
      <circle cx="229" cy="91" r="2.5" fill="currentColor" opacity=".55" />
    </svg>
  );
}

const THEMES = {
  day: {
    Icon: Sun,
    iconClass: 'text-ember',
    glow: 'group-hover:shadow-[0_0_52px_-14px_rgba(216,162,74,0.5)]',
    // front (scenic): just enough contrast for text; keep the artwork visible.
    scrim:
      'bg-[linear-gradient(180deg,rgba(17,11,6,0.58)_0%,rgba(17,11,6,0.34)_38%,rgba(15,10,6,0.16)_66%,rgba(12,8,4,0.46)_100%)]',
    // back (menu): lighter + even — the menu art already keeps a calm centre for text
    scrimBack:
      'bg-[linear-gradient(180deg,rgba(17,11,6,0.42)_0%,rgba(17,11,6,0.24)_45%,rgba(12,8,4,0.36)_100%)]',
  },
  night: {
    Icon: Moon,
    iconClass: 'text-[#c6d0ef]',
    glow: 'group-hover:shadow-[0_0_52px_-14px_rgba(126,146,214,0.45)]',
    scrim:
      'bg-[linear-gradient(180deg,rgba(8,9,16,0.58)_0%,rgba(8,9,16,0.34)_38%,rgba(7,8,14,0.18)_66%,rgba(5,6,11,0.48)_100%)]',
    scrimBack:
      'bg-[linear-gradient(180deg,rgba(8,9,16,0.42)_0%,rgba(8,9,16,0.24)_45%,rgba(5,6,11,0.38)_100%)]',
  },
} as const;

function CardBackdrop({
  src,
  scrim,
  pos,
  fit = 'object-cover',
  loading = 'lazy',
}: {
  src: string;
  scrim: string;
  pos: string;
  fit?: string;
  loading?: 'eager' | 'lazy';
}) {
  return (
    <>
      {/* decorative, pre-optimized background — plain img avoids needless re-encoding */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        decoding="async"
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${fit} ${pos}`}
      />
      <div className={`pointer-events-none absolute inset-0 z-[1] ${scrim}`} />
    </>
  );
}

function PlanCard({
  plan,
  labels,
  details,
  locale,
  perPerson,
  euro,
}: {
  plan: Plan;
  labels: Labels;
  details: Details;
  locale: string;
  perPerson: string;
  euro: (v: number) => string;
}) {
  const [flipped, setFlipped] = useState(false);
  const activeTheme = useTheme();
  const isLight = activeTheme === 'light';
  const theme = plan.id === 'diner' ? THEMES.night : THEMES.day;
  const Icon = theme.Icon;
  const isDinner = plan.id === 'diner';
  const dinnerTime = useDinnerTime(locale, plan.time);
  const displayTime = isDinner ? dinnerTime : plan.time;
  const formulaBg = isDinner
    ? isLight
      ? formulaDinnerLight
      : formulaDinnerDark
    : isLight
      ? formulaLunchLight
      : formulaLunchDark;
  const cardTheme = isLight ? 'light' : 'dark';
  const iconClass = isLight ? (isDinner ? 'text-[#52637d]' : 'text-[#bd7418]') : theme.iconClass;
  const frontScrim = isLight
    ? isDinner
      ? 'bg-[linear-gradient(180deg,rgba(255,252,244,0.08)_0%,rgba(255,248,238,0.02)_48%,rgba(250,240,226,0.06)_100%)]'
      : 'bg-[linear-gradient(180deg,rgba(255,249,236,0.06)_0%,rgba(255,245,224,0.015)_48%,rgba(242,219,184,0.055)_100%)]'
    : theme.scrim;
  const backScrim = isLight
    ? isDinner
      ? 'bg-[linear-gradient(180deg,rgba(255,253,247,0.14)_0%,rgba(255,248,238,0.06)_48%,rgba(246,236,222,0.14)_100%)]'
      : 'bg-[linear-gradient(180deg,rgba(255,250,240,0.12)_0%,rgba(255,243,220,0.05)_48%,rgba(241,219,188,0.12)_100%)]'
    : theme.scrimBack;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === 'Escape' && flipped) {
      setFlipped(false);
    }
  };

  const faceShell = `flip-face relative flex h-full flex-col overflow-hidden rounded-[28px] border transition-shadow duration-500 ${
    isLight
      ? isDinner
        ? 'border-[#cbd4e5] bg-[#f8f2e8] shadow-[0_24px_72px_-52px_rgba(39,56,84,0.55)] group-hover:shadow-[0_30px_88px_-62px_rgba(80,104,143,0.46)]'
        : 'border-[#d8c099] bg-[#fbefd6] shadow-[0_24px_72px_-52px_rgba(133,78,16,0.48)] group-hover:shadow-[0_30px_88px_-62px_rgba(205,135,28,0.42)]'
      : `border-cream/10 bg-ink-soft ${theme.glow}`
  }`;
  // Tight, multi-directional dark halo — keeps contrast independent of the art behind it
  // (a soft blur dies over the bright sun/moon/filigree). Applied to all card text.
  const content = isLight
    ? 'relative z-10 flex flex-1 flex-col p-8 md:p-9 [text-shadow:0_1px_0_rgba(255,255,255,0.72)]'
    : 'relative z-10 flex flex-1 flex-col p-8 md:p-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.9),0_2px_12px_rgba(0,0,0,0.7)]';
  const contentBack = isLight
    ? 'relative z-10 flex flex-1 flex-col p-7 sm:p-8 md:p-9 [text-shadow:0_1px_0_rgba(255,255,255,0.68)]'
    : 'relative z-10 flex flex-1 flex-col p-7 sm:p-8 md:p-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.58)]';
  // Gold eyebrow / time labels are the worst offenders (gold-on-bright). Brighter gold +
  // a near-opaque letterpress halo so the dark "cut" carries the legibility, not the fill.
  const goldLabel = isLight
    ? isDinner
      ? 'text-[#5b6682] [text-shadow:0_1px_0_rgba(255,255,255,0.72)]'
      : 'text-[#9b5b0f] [text-shadow:0_1px_0_rgba(255,255,255,0.76)]'
    : 'text-ember-soft [text-shadow:0_1px_2px_rgba(0,0,0,0.98),0_0_3px_rgba(0,0,0,0.96),0_0_7px_rgba(0,0,0,0.6)]';
  const timeLabel =
    `shrink-0 text-right text-[0.66rem] leading-relaxed tracking-[0.14em] sm:text-xs sm:tracking-[0.18em] ${goldLabel}`;
  const backPanel = isLight
    ? isDinner
      ? 'border-[#b7c2d6]/75 bg-[linear-gradient(180deg,rgba(255,253,248,0.86),rgba(238,232,222,0.76))] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_24px_54px_-38px_rgba(60,74,96,0.5)]'
      : 'border-[#d8bf94]/80 bg-[linear-gradient(180deg,rgba(255,250,239,0.88),rgba(247,228,194,0.76))] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_24px_54px_-38px_rgba(126,73,18,0.46)]'
    : isDinner
      ? 'border-[#9fb3ff]/[0.18] bg-[linear-gradient(180deg,rgba(7,9,21,0.88),rgba(7,8,17,0.72)_48%,rgba(4,5,11,0.9))] shadow-[inset_0_1px_0_rgba(205,218,255,0.08),0_26px_58px_-36px_rgba(0,0,0,0.95)]'
      : 'border-ember/[0.28] bg-[linear-gradient(180deg,rgba(55,35,17,0.82),rgba(37,25,14,0.66)_48%,rgba(25,17,10,0.84))] shadow-[inset_0_1px_0_rgba(255,230,170,0.1),0_26px_58px_-36px_rgba(0,0,0,0.92)]';
  const backPanelGlow = isLight
    ? isDinner
      ? 'bg-[radial-gradient(circle_at_78%_6%,rgba(130,149,184,0.13),transparent_35%),radial-gradient(circle_at_12%_90%,rgba(216,162,74,0.12),transparent_34%)]'
      : 'bg-[radial-gradient(circle_at_75%_0%,rgba(255,193,91,0.18),transparent_34%),radial-gradient(circle_at_10%_92%,rgba(151,83,15,0.1),transparent_34%)]'
    : isDinner
      ? 'bg-[radial-gradient(circle_at_78%_6%,rgba(166,185,255,0.16),transparent_35%),radial-gradient(circle_at_12%_90%,rgba(216,162,74,0.11),transparent_34%)]'
      : 'bg-[radial-gradient(circle_at_75%_0%,rgba(255,190,86,0.2),transparent_34%),radial-gradient(circle_at_10%_92%,rgba(139,76,20,0.24),transparent_34%)]';
  const menuHeaderMark = isLight
    ? isDinner
      ? 'border-[#a9b6cf]/70 bg-[#eef3fb]/70 text-[#52637d]'
      : 'border-[#d5b778]/80 bg-[#fff7e8]/76 text-[#9b5b0f]'
    : isDinner
      ? 'border-[#b8c7ff]/25 bg-[#b8c7ff]/10 text-[#dce5ff]'
      : 'border-ember/[0.3] bg-ember/[0.16] text-ember-soft';
  const menuRow = isLight
    ? isDinner
      ? 'border-[#c8d1df]/80 bg-[linear-gradient(90deg,rgba(255,255,255,0.58),rgba(238,243,250,0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]'
      : 'border-[#dfc99f]/80 bg-[linear-gradient(90deg,rgba(255,250,239,0.64),rgba(255,243,220,0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]'
    : isDinner
      ? 'border-[#c7d5ff]/[0.12] bg-[linear-gradient(90deg,rgba(178,196,255,0.075),rgba(255,255,255,0.025))] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]'
      : 'border-ember/[0.13] bg-[linear-gradient(90deg,rgba(255,224,158,0.09),rgba(255,255,255,0.025))] shadow-[inset_0_1px_0_rgba(255,230,170,0.055)]';
  const menuIndex = isLight
    ? isDinner
      ? 'border-[#a9b6cf]/70 bg-[#eef3fb]/72 text-[#52637d]'
      : 'border-[#d5b778]/80 bg-[#fff6e7]/78 text-[#9b5b0f]'
    : isDinner
      ? 'border-[#b8c7ff]/20 bg-[#b8c7ff]/10 text-[#e1e8ff]'
      : 'border-ember/[0.24] bg-ember/[0.13] text-ember-soft';
  const noteTone = isLight
    ? isDinner
      ? 'border-[#7f8ca5]/35 text-cream/[0.66]'
      : 'border-[#bd7418]/32 text-cream/[0.66]'
    : isDinner
      ? 'border-[#b8c7ff]/25 text-[#d9e0ff]/70'
      : 'border-ember/[0.32] text-cream/[0.68]';

  return (
    <div data-reveal data-theme={cardTheme} className="flip-card relative h-full">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${plan.name} — ${euro(plan.adults)} ${perPerson}. ${flipped ? details.back : details.flipHint}`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={onKeyDown}
        className={`flip-inner group relative min-h-[760px] cursor-pointer rounded-[28px] outline-none ring-ember/70 ring-offset-2 ring-offset-ink focus-visible:ring-2 md:min-h-[770px] ${
          flipped ? 'is-flipped' : ''
        }`}
      >
        {/* FRONT — price over the day/night scene */}
        <div aria-hidden={flipped} className={faceShell}>
          {/* lazy: this section sits far below the fold — eager loading here only
              competes with the hero image during the initial page load */}
          <CardBackdrop
            src={formulaBg.src}
            scrim={frontScrim}
            pos="object-center"
            fit="object-fill"
          />
          <div className={content}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconClass}`} />
                <h3 className="font-display text-3xl text-cream">{plan.name}</h3>
              </div>
              <span className={timeLabel}>{displayTime}</span>
            </div>
            <p className="mt-1 text-sm text-cream/75">{plan.days}</p>

            <div className="mt-7 flex items-end gap-1.5">
              <span className="font-display text-6xl text-cream tabular md:text-7xl">{euro(plan.adults)}</span>
              <span className="mb-2 text-sm text-cream/75">{perPerson}</span>
            </div>
            <p className="mt-1 text-sm text-cream/75">{labels.adults}</p>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-cream/15 pt-6 text-sm">
              <div>
                <div className="tabular text-lg font-semibold text-cream">{euro(plan.kids)}</div>
                <div className="mt-0.5 text-cream/75">{labels.kids}</div>
              </div>
              <div>
                <div className="tabular text-lg font-semibold text-cream">{euro(plan.under5)}</div>
                <div className="mt-0.5 text-cream/75">{labels.under5}</div>
              </div>
            </div>

            {/* affordance — clearly invites the tap/flip */}
            <div className="mt-auto flex items-center gap-2.5 pt-7 text-[0.8rem] font-medium text-ember/90 transition-colors duration-300 group-hover:text-ember">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/15 transition-colors duration-300 group-hover:border-ember/70 group-hover:bg-ember/25">
                <Flip className="h-3.5 w-3.5" />
              </span>
              {details.flipHint}
            </div>
          </div>
        </div>

        {/* BACK — menu page: what's included, over the framed menu art */}
        <div aria-hidden={!flipped} className={`flip-back ${faceShell}`}>
          <CardBackdrop
            src={formulaBg.src}
            scrim={backScrim}
            pos="object-center"
            fit="object-fill"
          />
          <div className={contentBack}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconClass}`} />
                <h3 className="font-display text-2xl text-cream">{plan.name}</h3>
              </div>
              <span className={timeLabel}>{displayTime}</span>
            </div>
            <p className={`mt-1 text-[0.7rem] font-medium uppercase tracking-eyebrow ${goldLabel}`}>
              {details.backTitle}
            </p>

            <div
              className={`relative mt-6 overflow-hidden rounded-[26px] border px-4 py-4 backdrop-blur-[10px] sm:px-5 ${backPanel}`}
            >
              <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${backPanelGlow}`} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cream/25 to-transparent"
              />

              <div className="relative z-10 flex items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${menuHeaderMark}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className={`text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.22em] ${goldLabel}`}>
                    {details.kitchensTitle}
                  </p>
                </div>
              </div>

              <ul className="relative z-10 mt-4 grid gap-2">
                {plan.kitchens.map((k, index) => (
                  <li
                    key={k}
                    aria-label={k}
                    className={`grid grid-cols-[3rem_1fr] items-center gap-3 rounded-[16px] border px-3.5 py-[0.58rem] ${menuRow}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-7 min-w-8 items-center justify-center rounded-full border tabular text-[0.62rem] font-semibold tracking-[0.16em] ${menuIndex}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.96rem] font-medium leading-snug text-cream/[0.9]">
                      {k}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className={`mt-4 border-l pl-3 text-xs leading-relaxed ${noteTone}`}>
              {details.alaMinute}
            </p>

            <div className="mt-auto flex items-center gap-2.5 pt-6 text-[0.8rem] font-medium text-ember/90 transition-colors duration-300 group-hover:text-ember">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/15">
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
              {details.back}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventMenuCard({
  kind,
  title,
  menuTitle,
  menuSubtitle,
  menuItems,
  backLabel,
  children,
}: {
  kind: 'new-year' | 'birthday';
  title: string;
  menuTitle: string;
  menuSubtitle: string;
  menuItems: string[];
  backLabel: string;
  children: ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);
  const isLight = useTheme() === 'light';
  const isBirthday = kind === 'birthday';
  const Icon = Sparkle;
  const eventBg = isBirthday
    ? isLight
      ? eventBirthdayLight
      : eventBirthdayDark
    : isLight
      ? eventNewYearLight
      : eventNewYearDark;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === 'Escape' && flipped) {
      setFlipped(false);
    }
  };

  const faceShell = `flip-face relative flex h-full flex-col overflow-hidden rounded-[30px] border transition-all duration-500 ${
    isLight
      ? isBirthday
        ? 'border-[#e9bd7f] bg-[#fff0dd] shadow-[0_24px_70px_-48px_rgba(151,83,15,0.5)]'
        : 'border-[#d8c5a9] bg-[#f8efe2] shadow-[0_24px_70px_-48px_rgba(89,45,18,0.42)]'
      : isBirthday
        ? 'border-[#b86f3a]/35 bg-[#1c100c] shadow-[0_26px_70px_-50px_rgba(0,0,0,0.96)] group-hover:shadow-[0_30px_86px_-58px_rgba(216,162,74,0.42)]'
        : 'border-ember/[0.24] bg-[#17110d] shadow-[0_26px_70px_-50px_rgba(0,0,0,0.96)] group-hover:shadow-[0_30px_86px_-58px_rgba(205,135,28,0.34)]'
  }`;
  const aura = isLight
    ? isBirthday
      ? 'bg-[radial-gradient(circle_at_16%_16%,rgba(255,255,255,0.24),transparent_34%),linear-gradient(180deg,rgba(255,252,246,0.045),rgba(255,239,216,0.06))]'
      : 'bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.22),transparent_34%),linear-gradient(180deg,rgba(255,252,246,0.04),rgba(247,238,225,0.055))]'
    : isBirthday
      ? 'bg-[radial-gradient(circle_at_18%_14%,rgba(216,162,74,0.055),transparent_34%),linear-gradient(180deg,rgba(16,10,7,0.06),rgba(12,8,6,0.18))]'
      : 'bg-[radial-gradient(circle_at_18%_14%,rgba(216,162,74,0.05),transparent_34%),linear-gradient(180deg,rgba(13,9,6,0.055),rgba(10,7,5,0.16))]';
  const grain = isLight
    ? 'bg-[linear-gradient(110deg,rgba(255,255,255,0.12),transparent_26%,rgba(255,255,255,0.04)_56%,transparent_76%)] opacity-35'
    : 'bg-[linear-gradient(110deg,rgba(255,215,139,0.025),transparent_26%,rgba(255,255,255,0.015)_56%,transparent_76%)] opacity-45';
  const innerFrame = isLight
    ? isBirthday
      ? 'border-[#e9c184]/70'
      : 'border-[#d7bd8b]/65'
    : isBirthday
      ? 'border-[#d8a24a]/20'
      : 'border-ember/[0.18]';
  const facePanel = isLight
    ? isBirthday
      ? 'border-[#e9c184]/70 bg-[#fff9ee]/54 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
      : 'border-[#dac49b]/70 bg-[#fffaf0]/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]'
    : isBirthday
      ? 'border-ember/[0.13] bg-black/[0.16] shadow-[inset_0_1px_0_rgba(255,230,170,0.055)]'
      : 'border-ember/[0.12] bg-black/[0.14] shadow-[inset_0_1px_0_rgba(255,230,170,0.05)]';
  const menuSurface = isLight
    ? 'border-[#d8bf94] bg-[linear-gradient(180deg,rgba(255,250,240,0.92),rgba(246,230,205,0.82))] text-[#2a1e16] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_42px_-34px_rgba(91,47,16,0.48)]'
    : isBirthday
      ? 'border-ember/[0.22] bg-[linear-gradient(180deg,rgba(39,24,18,0.88),rgba(18,12,10,0.86))] text-cream shadow-[inset_0_1px_0_rgba(255,230,170,0.08),0_20px_46px_-34px_rgba(0,0,0,0.92)]'
      : 'border-ember/[0.2] bg-[linear-gradient(180deg,rgba(33,21,13,0.9),rgba(15,10,7,0.86))] text-cream shadow-[inset_0_1px_0_rgba(255,230,170,0.07),0_20px_46px_-34px_rgba(0,0,0,0.94)]';
  const menuChip = isLight
    ? 'border-[#d5b778] bg-[#fff8eb]/80 text-[#8f5611] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]'
    : isBirthday
      ? 'border-ember/[0.24] bg-ember/[0.12] text-ember-soft'
      : 'border-ember/[0.22] bg-ember/[0.1] text-ember-soft';
  const rowSurface = isLight
    ? 'border-[#dfc99f]/75 bg-[#fffaf0]/54 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]'
    : isBirthday
      ? 'border-cream/[0.09] bg-white/[0.04]'
      : 'border-cream/[0.08] bg-white/[0.032]';

  return (
    <div data-reveal data-theme={isLight ? 'light' : 'dark'} className="flip-card relative h-full">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${title} — ${flipped ? backLabel : 'Menu'}`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={onKeyDown}
        className={`flip-inner group relative min-h-[500px] cursor-pointer rounded-[30px] outline-none ring-ember/70 ring-offset-2 ring-offset-ink focus-visible:ring-2 ${
          flipped ? 'is-flipped' : ''
        }`}
      >
        <div aria-hidden={flipped} className={faceShell}>
          {/* Generated with ChatGPT Image / GPT Image. Decorative only; real text stays HTML. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={eventBg.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={`pointer-events-none absolute inset-0 h-full w-full object-fill ${
              isLight ? 'opacity-100' : 'opacity-[0.98]'
            }`}
          />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${aura}`} />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${grain}`} />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-[18px] rounded-[24px] border ${innerFrame}`} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-ember/45 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-ember/25 to-transparent"
          />
          <div className="relative z-10 flex flex-1 flex-col p-7 sm:p-8">
            <div className={`rounded-[24px] border p-4 sm:p-5 ${facePanel}`}>
              {children}
            </div>
            <div className="mt-auto flex items-center gap-2.5 pt-6 text-[0.8rem] font-semibold text-ember transition-colors duration-300 group-hover:text-ember-soft">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/15 transition-colors duration-300 group-hover:border-ember/70 group-hover:bg-ember/25">
                <Flip className="h-3.5 w-3.5" />
              </span>
              Menu
            </div>
          </div>
        </div>

        <div aria-hidden={!flipped} className={`flip-back ${faceShell}`}>
          {/* Generated with ChatGPT Image / GPT Image. Decorative only; real text stays HTML. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={eventBg.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={`pointer-events-none absolute inset-0 h-full w-full object-fill ${
              isLight ? 'opacity-100' : 'opacity-[0.98]'
            }`}
          />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${aura}`} />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${grain}`} />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-[18px] rounded-[24px] border ${innerFrame}`} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-ember/45 to-transparent"
          />
          <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-ember">
                  {menuSubtitle}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight text-cream">
                  {menuTitle}
                </h3>
              </div>
              <span
                aria-hidden="true"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${menuChip}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <div className={`mt-4 rounded-[22px] border p-3.5 backdrop-blur-[6px] ${menuSurface}`}>
              <ul className="grid grid-cols-1 gap-1.5 min-[390px]:grid-cols-2">
                {menuItems.map((item) => (
                  <li
                    key={item}
                    className={`flex min-h-8 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[0.72rem] font-medium leading-snug ${
                      item.length > 30 ? 'col-span-2' : ''
                    } ${rowSurface}`}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex items-center gap-2.5 pt-4 text-[0.8rem] font-semibold text-ember transition-colors duration-300 group-hover:text-ember-soft">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/15">
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
              {backLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Formules() {
  const t = useTranslations('formules');
  const locale = useLocale();
  const plans = t.raw('plans') as Plan[];
  const included = t.raw('included') as string[];
  const special = t.raw('special') as Special[];
  const labels = t.raw('labels') as Labels;
  const details = t.raw('details') as Details;

  const euro = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    }).format(v);

  return (
    <section id="formules" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-16">
          <SectionEmblem variant="formules" align="center" className="mb-3" />
          <p data-reveal className="eyebrow mb-5 justify-center">
            {t('eyebrow')}
          </p>
          <h2
            data-reveal
            className="font-display text-4xl leading-tight text-cream sm:text-5xl md:text-6xl"
          >
            {t('title')}
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream/70">
            {t('intro')}
          </p>
        </div>

        {/* Main plans — tap a card to flip it and reveal what's included */}
        <div className="mx-auto grid max-w-4xl items-stretch gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              labels={labels}
              details={details}
              locale={locale}
              perPerson={t('perPerson')}
              euro={euro}
            />
          ))}
        </div>

        {/* Included */}
        <div data-reveal className="mx-auto mt-10 max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="text-xs uppercase tracking-eyebrow text-ember">
              {t('includedTitle')}
            </span>
            {included.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 text-sm text-cream/75">
                <Check className="h-4 w-4 text-ember" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Special + birthday */}
        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-5 md:grid-cols-2">
          <EventMenuCard
            kind="new-year"
            title={t('specialTitle')}
            menuTitle={special[0]?.name ?? "New Year's Eve"}
            menuSubtitle={special[0]?.date ?? '31 December'}
            menuItems={NEW_YEAR_MENU}
            backLabel={details.back}
          >
            <h3 className="text-xs uppercase tracking-eyebrow text-ember">
              {t('specialTitle')}
            </h3>
            <ul className="mt-5 space-y-4">
              {special.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 border-b border-cream/10 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium text-cream">{s.name}</div>
                    <div className="text-sm text-cream/65">{s.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-lg font-semibold text-cream">{euro(s.adults)}</div>
                    <div className="text-xs text-cream/60">{labels.adults}</div>
                  </div>
                </li>
              ))}
            </ul>
          </EventMenuCard>

          <EventMenuCard
            kind="birthday"
            title={t('birthday.title')}
            menuTitle={t('birthday.title')}
            menuSubtitle="Menu"
            menuItems={BIRTHDAY_MENU}
            backLabel={details.back}
          >
            <Sparkle className="h-7 w-7 text-ember" />
            <h3 className="mt-4 font-display text-2xl text-cream">{t('birthday.title')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">{t('birthday.body')}</p>
          </EventMenuCard>
        </div>

        <p data-reveal className="mt-10 text-center text-sm text-cream/60">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
