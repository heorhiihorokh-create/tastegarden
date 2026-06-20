import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['nl', 'fr', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
