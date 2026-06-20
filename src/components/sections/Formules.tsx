'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CountUp } from '@/components/motion/CountUp';
import { Check, Sparkle } from '@/components/ui/Icons';

type Plan = {
  id: string;
  name: string;
  days: string;
  time: string;
  adults: number;
  kids: number;
  under5: number;
  featured?: boolean;
};

type Special = {
  id: string;
  name: string;
  date: string;
  adults: number;
  kids: number;
  under5: number;
};

export function Formules() {
  const t = useTranslations('formules');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const plans = t.raw('plans') as Plan[];
  const included = t.raw('included') as string[];
  const special = t.raw('special') as Special[];
  const labels = t.raw('labels') as Record<string, string>;

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

        {/* Main plans */}
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              data-reveal
              className={`relative overflow-hidden rounded-[28px] p-8 md:p-9 ${
                plan.featured
                  ? 'border border-crimson/40 bg-gradient-to-b from-crimson/15 to-white/[0.02] shadow-glow'
                  : 'glass'
              }`}
            >
              {plan.featured && (
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-60 blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(193,39,45,0.5), transparent 70%)' }}
                />
              )}
              <div className="relative flex items-baseline justify-between">
                <h3 className="font-display text-3xl text-cream">{plan.name}</h3>
                <span className="text-xs uppercase tracking-eyebrow text-ember">
                  {plan.time}
                </span>
              </div>
              <p className="relative mt-1 text-sm text-cream/55">{plan.days}</p>

              <div className="relative mt-7 flex items-end gap-1.5">
                <span className="font-display text-6xl text-cream tabular md:text-7xl">
                  <CountUp value={plan.adults} prefix="€" />
                </span>
                <span className="mb-2 text-sm text-cream/55">{t('perPerson')}</span>
              </div>
              <p className="relative mt-1 text-sm text-cream/55">{labels.adults}</p>

              <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-cream/10 pt-6 text-sm">
                <div>
                  <div className="tabular text-lg font-semibold text-cream">{euro(plan.kids)}</div>
                  <div className="mt-0.5 text-cream/55">{labels.kids}</div>
                </div>
                <div>
                  <div className="tabular text-lg font-semibold text-cream">{euro(plan.under5)}</div>
                  <div className="mt-0.5 text-cream/55">{labels.under5}</div>
                </div>
              </div>

              <a
                href="#reservation"
                className={`relative mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-crimson text-cream hover:bg-crimson-bright'
                    : 'border border-cream/20 text-cream hover:border-ember/60 hover:text-ember'
                }`}
              >
                {tNav('reserve')}
              </a>
            </div>
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
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <div data-reveal className="glass rounded-3xl p-7">
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
                    <div className="text-sm text-cream/50">{s.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-lg font-semibold text-cream">{euro(s.adults)}</div>
                    <div className="text-xs text-cream/45">{labels.adults}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal
            className="relative overflow-hidden rounded-3xl border border-ember/30 bg-gradient-to-b from-ember/10 to-transparent p-7"
          >
            <Sparkle className="h-7 w-7 text-ember" />
            <h3 className="mt-4 font-display text-2xl text-cream">{t('birthday.title')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">{t('birthday.body')}</p>
          </div>
        </div>

        <p data-reveal className="mt-10 text-center text-sm text-cream/45">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
