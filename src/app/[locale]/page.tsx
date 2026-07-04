import { setRequestLocale } from 'next-intl/server';
import { getBannerStatus, type Locale } from '@/lib/settings';
import { getScheduleConfig } from '@/lib/scheduleConfig.server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyMobileBar } from '@/components/layout/StickyMobileBar';
import { PortfolioReturn } from '@/components/layout/PortfolioReturn';
import { ReservationAvailabilityProvider, type ReservationUnavailableReason } from '@/components/providers/ReservationAvailability';
import { Hero } from '@/components/sections/Hero';
import { Concept } from '@/components/sections/Concept';
import { Stations } from '@/components/sections/Stations';
import { KitchenContinuum } from '@/components/sections/KitchenContinuum';
import { Dishes } from '@/components/sections/Dishes';
import { Formules } from '@/components/sections/Formules';
import { Ambiance } from '@/components/sections/Ambiance';
import { Practical } from '@/components/sections/Practical';
import { Reservation } from '@/components/sections/Reservation';

// The marketing page itself is mostly static-looking, but the reservation
// status and announcement banner are owner-controlled from /admin. Force a
// fresh server render so "closed/open" and seasonal announcements never lag
// behind a stale SSG snapshot.
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [status, schedule] = await Promise.all([getBannerStatus(), getScheduleConfig()]);
  const currentLocale = (['nl', 'fr', 'en'].includes(locale) ? locale : 'nl') as Locale;
  const pickLocalized = (values: Record<Locale, string>) =>
    values[currentLocale]?.trim() || values.nl?.trim() || values.fr?.trim() || values.en?.trim() || '';

  const closedMessage = pickLocalized(status.message);
  const holiday = {
    active: status.holiday.active,
    blocksReservations: status.holiday.blocksReservations,
    blockWindow: status.holiday.blockWindow,
    theme: status.holiday.theme,
    title: pickLocalized(status.holiday.title),
    message: pickLocalized(status.holiday.message),
  };
  const availabilityReason: ReservationUnavailableReason = holiday.blocksReservations
    ? 'holiday'
    : status.bookingsClosed
      ? 'manual'
      : null;

  return (
    <ReservationAvailabilityProvider reason={availabilityReason}>
      <Header />
      <main>
        <Hero />
        <KitchenContinuum>
          <Concept />
          <Stations />
        </KitchenContinuum>
        <Formules />
        <Dishes />
        <Practical schedule={schedule} />
        <Reservation bookingsClosed={status.bookingsClosed} closedMessage={closedMessage} holiday={holiday} schedule={schedule} />
        <Ambiance />
      </main>
      <Footer />
      <StickyMobileBar />
      <PortfolioReturn />
    </ReservationAvailabilityProvider>
  );
}
