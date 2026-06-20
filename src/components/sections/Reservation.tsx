'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Phone, ArrowRight } from '@/components/ui/Icons';

type Status = 'idle' | 'sending' | 'success' | 'error';
type Values = {
  service: 'lunch' | 'dinner';
  date: string;
  time: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  occasion: string;
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
  occasion: '',
  message: '',
};

export function Reservation() {
  const t = useTranslations('reservation');
  const f = useTranslations('reservation.form');
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof Values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const e: Partial<Record<keyof Values, string>> = {};
    (['date', 'time', 'name', 'phone', 'email'] as const).forEach((k) => {
      if (!values[k].trim()) e[k] = t('required');
    });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = t('invalidEmail');
    }
    return e;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full rounded-xl border border-cream/15 bg-white/[0.03] px-4 py-3 text-sm text-cream placeholder-cream/35 transition-colors duration-300 focus:border-ember/60 [color-scheme:dark]';
  const labelCls = 'mb-2 block text-xs font-medium uppercase tracking-wide text-cream/55';

  return (
    <section id="reservation" className="scroll-mt-24 py-24 md:py-32">
      <div className="container-edge">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Intro */}
          <div className="lg:pt-6">
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
            <a
              data-reveal
              href="tel:+3251303888"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-cream/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-cream transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Phone className="h-[18px] w-[18px] text-ember" />
              {t('phoneCta')}
            </a>
          </div>

          {/* Form / success */}
          <div data-reveal className="glass rounded-[28px] p-6 md:p-9">
            {status === 'success' ? (
              <div className="flex flex-col items-center py-10 text-center">
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
                    setValues(initial);
                    setStatus('idle');
                  }}
                  className="mt-7 text-sm font-medium text-ember underline-offset-4 hover:underline"
                >
                  {t('success.again')}
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
                {/* Service toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-cream/10 bg-white/[0.02] p-1">
                  {(['lunch', 'dinner'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('service', s)}
                      className={`rounded-lg py-2.5 text-sm font-medium transition-colors duration-300 ${
                        values.service === s
                          ? 'bg-crimson text-cream'
                          : 'text-cream/60 hover:text-cream'
                      }`}
                    >
                      {f(s)}
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={f('date')}
                    error={errors.date}
                    labelCls={labelCls}
                  >
                    <input
                      type="date"
                      className={field}
                      value={values.date}
                      aria-invalid={!!errors.date}
                      onChange={(e) => set('date', e.target.value)}
                    />
                  </Field>
                  <Field label={f('time')} error={errors.time} labelCls={labelCls}>
                    <input
                      type="time"
                      className={field}
                      value={values.time}
                      aria-invalid={!!errors.time}
                      onChange={(e) => set('time', e.target.value)}
                    />
                  </Field>
                </div>

                <Field label={f('guests')} labelCls={labelCls}>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    inputMode="numeric"
                    className={field}
                    value={values.guests}
                    onChange={(e) => set('guests', e.target.value)}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={f('name')} error={errors.name} labelCls={labelCls}>
                    <input
                      type="text"
                      autoComplete="name"
                      className={field}
                      value={values.name}
                      aria-invalid={!!errors.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </Field>
                  <Field label={f('phone')} error={errors.phone} labelCls={labelCls}>
                    <input
                      type="tel"
                      autoComplete="tel"
                      className={field}
                      value={values.phone}
                      aria-invalid={!!errors.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                  </Field>
                </div>

                <Field label={f('email')} error={errors.email} labelCls={labelCls}>
                  <input
                    type="email"
                    autoComplete="email"
                    className={field}
                    value={values.email}
                    aria-invalid={!!errors.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </Field>

                <Field
                  label={`${f('message')} · ${f('optional')}`}
                  labelCls={labelCls}
                >
                  <textarea
                    rows={3}
                    placeholder={f('messagePlaceholder')}
                    className={`${field} resize-none`}
                    value={values.message}
                    onChange={(e) => set('message', e.target.value)}
                  />
                </Field>

                {status === 'error' && (
                  <p role="alert" className="text-sm text-crimson-bright">
                    {t('error')}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-crimson py-4 text-sm font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? f('sending') : f('submit')}
                  {status !== 'sending' && (
                    <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  labelCls,
  children,
}: {
  label: string;
  error?: string;
  labelCls: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-crimson-bright">
          {error}
        </p>
      )}
    </div>
  );
}
