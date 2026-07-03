import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';
import { applyOverrides, getContentOverrides } from '@/lib/content';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const base = (await import(`../../messages/${locale}.json`)).default;
  // Merge admin-edited content (from the database) over the JSON defaults.
  const overrides = await getContentOverrides(locale);

  return {
    locale,
    messages: applyOverrides(base, overrides),
  };
});
