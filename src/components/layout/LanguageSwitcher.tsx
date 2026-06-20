'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('lang');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-cream/15 bg-white/[0.03] p-0.5 ${className}`}
      role="group"
      aria-label={t('label')}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            aria-current={active ? 'true' : undefined}
            onClick={() => router.replace(pathname, { locale: loc })}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-300 ${
              active
                ? 'bg-crimson text-cream'
                : 'text-cream/55 hover:text-cream'
            }`}
          >
            {t(loc)}
          </button>
        );
      })}
    </div>
  );
}
