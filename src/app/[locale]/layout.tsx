import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import '../globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

type Params = { locale: string };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://www.tastegarden.be'),
    alternates: {
      canonical: `/${locale}`,
      languages: { nl: '/nl', fr: '/fr', en: '/en' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
      siteName: 'Taste Garden',
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Taste Garden — Wereld Keuken' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og.jpg'],
    },
    icons: { icon: '/favicon.svg' },
  };
}

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Taste Garden — Wereld Keuken',
  url: 'https://www.tastegarden.be',
  image: 'https://www.tastegarden.be/og.jpg',
  servesCuisine: ['Asian', 'Chinese', 'Japanese', 'Sushi', 'Teppanyaki', 'Wok'],
  priceRange: '€€',
  acceptsReservations: true,
  telephone: '+3251303888',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kortrijksestraat 276',
    postalCode: '8870',
    addressLocality: 'Izegem',
    addressCountry: 'BE',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 50.9086, longitude: 3.2168 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday'], opens: '11:30', closes: '14:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday'], opens: '18:00', closes: '22:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '11:30', closes: '14:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday', 'Saturday'], opens: '18:00', closes: '23:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '11:30', closes: '16:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '18:00', closes: '22:00' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ink text-cream antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
