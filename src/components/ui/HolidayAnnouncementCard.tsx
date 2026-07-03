import Image from 'next/image';
import type { CSSProperties } from 'react';

export type HolidaySeason = 'summer' | 'autumn' | 'winter' | 'spring';

const SEASON_STYLES: Record<
  HolidaySeason,
  {
    label: string;
    image: string;
    gradient: string;
    accent: string;
    glow: string;
    textGlow: string;
  }
> = {
  summer: {
    label: 'Zomer',
    image: '/images/holiday/holiday-summer.png',
    gradient: 'from-[#2b1309] via-[#63310f] to-[#b06b19]',
    accent: '#ffd37a',
    glow: 'rgba(255, 181, 66, 0.34)',
    textGlow: 'rgba(26, 8, 2, 0.72)',
  },
  autumn: {
    label: 'Herfst',
    image: '/images/holiday/holiday-autumn.png',
    gradient: 'from-[#2f140a] via-[#653019] to-[#9a4f1c]',
    accent: '#f5bd69',
    glow: 'rgba(222, 114, 38, 0.32)',
    textGlow: 'rgba(24, 7, 3, 0.74)',
  },
  winter: {
    label: 'Winter',
    image: '/images/holiday/holiday-winter.png',
    gradient: 'from-[#081527] via-[#112946] to-[#213f62]',
    accent: '#dceeff',
    glow: 'rgba(129, 194, 255, 0.24)',
    textGlow: 'rgba(3, 9, 21, 0.78)',
  },
  spring: {
    label: 'Lente',
    image: '/images/holiday/holiday-spring.png',
    gradient: 'from-[#102c20] via-[#27533b] to-[#5f7c46]',
    accent: '#ffe2eb',
    glow: 'rgba(134, 224, 166, 0.24)',
    textGlow: 'rgba(3, 20, 13, 0.72)',
  },
};

export function HolidayAnnouncementCard({
  theme,
  title,
  message,
  inactive = false,
  className = '',
  reveal = false,
}: {
  theme: HolidaySeason;
  title: string;
  message: string;
  inactive?: boolean;
  className?: string;
  reveal?: boolean;
}) {
  const style = SEASON_STYLES[theme] ?? SEASON_STYLES.summer;
  const cssVars = {
    '--holiday-accent': style.accent,
    '--holiday-glow': style.glow,
    '--holiday-text-glow': style.textGlow,
  } as CSSProperties;

  return (
    <div
      data-reveal={reveal ? '' : undefined}
      data-holiday-theme={theme}
      style={cssVars}
      className={`holiday-announcement-card relative isolate overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br ${style.gradient} p-6 text-white shadow-[0_26px_70px_-34px_rgba(0,0,0,0.72)] transition-all duration-500 md:p-8 ${
        inactive ? 'opacity-60' : ''
      } ${className}`}
    >
      <Image
        src={style.image}
        alt=""
        fill
        priority={reveal || !inactive}
        sizes="(min-width: 1024px) 720px, 100vw"
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-[0.96] saturate-[1.06]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(13,8,5,0.74)_0%,rgba(13,8,5,0.58)_39%,rgba(13,8,5,0.24)_72%,rgba(13,8,5,0.1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.14),transparent_16rem),radial-gradient(circle_at_86%_24%,var(--holiday-glow),transparent_20rem),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_42%,rgba(0,0,0,0.2))]" />
      <div className="holiday-announcement-card__inner pointer-events-none absolute inset-px -z-10 rounded-[1.45rem] border border-transparent shadow-[inset_0_-1px_0_rgba(0,0,0,0.22)]" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/18 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/86 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--holiday-accent)] shadow-[0_0_14px_var(--holiday-accent)]" />
          {style.label}
        </div>

        {title && (
          <h3 className="max-w-xl font-display text-2xl leading-tight text-white drop-shadow-[0_2px_14px_var(--holiday-text-glow)] md:text-[2rem]">
            {title}
          </h3>
        )}
        {message && (
          <p className="mt-2 max-w-2xl whitespace-pre-line text-[0.98rem] leading-relaxed text-white/91 drop-shadow-[0_1px_10px_var(--holiday-text-glow)]">
            {message}
          </p>
        )}

        {inactive && (
          <span className="mt-4 inline-flex rounded-full border border-white/16 bg-black/24 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur-sm">
            Nu verborgen op de website
          </span>
        )}
      </div>
    </div>
  );
}
