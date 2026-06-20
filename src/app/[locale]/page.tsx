import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyMobileBar } from '@/components/layout/StickyMobileBar';
import { Hero } from '@/components/sections/Hero';
import { Concept } from '@/components/sections/Concept';
import { Stations } from '@/components/sections/Stations';
import { Dishes } from '@/components/sections/Dishes';
import { Formules } from '@/components/sections/Formules';
import { Ambiance } from '@/components/sections/Ambiance';
import { Practical } from '@/components/sections/Practical';
import { Reservation } from '@/components/sections/Reservation';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Concept />
        <Stations />
        <Dishes />
        <Formules />
        <Ambiance />
        <Practical />
        <Reservation />
      </main>
      <Footer />
      <StickyMobileBar />
    </>
  );
}
