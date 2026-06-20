import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Facebook } from '@/components/ui/Icons';
import blossom from '../../../public/images/blossom.png';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink-deep">
      {/* Warm glow */}
      <div
        className="pointer-events-none absolute -top-44 left-1/2 h-96 w-[130%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, rgba(193,39,45,0.28), transparent 70%)' }}
      />

      {/* Blossom branches framing the footer */}
      <div
        data-reveal
        aria-hidden
        className="pointer-events-none absolute -left-8 top-0 w-[170px] opacity-90 sm:w-[230px] lg:w-[300px]"
      >
        <Image src={blossom} alt="" width={300} height={300} className="h-auto w-full" />
      </div>
      <div
        data-reveal
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 w-[170px] opacity-90 sm:w-[230px] lg:w-[300px]"
        style={{ transform: 'scaleX(-1)' }}
      >
        <Image src={blossom} alt="" width={300} height={300} className="h-auto w-full" />
      </div>

      <div className="container-edge relative flex flex-col items-center py-20 text-center md:py-28">
        <Logo width={210} className="h-auto w-[170px] sm:w-[200px]" />

        <p data-reveal className="mt-6 max-w-md text-sm leading-relaxed text-cream/65 sm:text-base">
          {t('tagline')}
        </p>

        <h2 data-reveal className="mt-12 font-display text-4xl text-cream sm:text-5xl">
          {t('follow')}
        </h2>
        <span data-reveal className="mt-3 h-px w-14 bg-ember/60" />

        <a
          data-reveal
          href="https://www.facebook.com/Taste-Garden-Izegem"
          target="_blank"
          rel="noreferrer"
          className="group mt-8 inline-flex items-center gap-3 rounded-full border border-ember/35 bg-white/[0.03] px-7 py-3.5 text-base font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-ember hover:text-ember"
        >
          <Facebook className="h-5 w-5 text-ember transition-colors group-hover:text-ember" />
          {t('facebook')}
        </a>
      </div>

      <div className="container-edge relative flex flex-col items-center gap-4 border-t border-cream/10 py-7 text-xs text-cream/60 sm:flex-row sm:justify-between">
        <p>
          © {year} Taste Garden — {t('credit')}. {t('rights')}
        </p>
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
