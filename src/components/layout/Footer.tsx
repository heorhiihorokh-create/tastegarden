import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Phone, MapPin, Facebook, ArrowRight } from '@/components/ui/Icons';

type Hour = { day: string; value: string };

export function Footer() {
  const t = useTranslations('footer');
  const p = useTranslations('practical');
  const hours = p.raw('hours') as Hour[];
  const address = p('address');
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink-deep">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(193,39,45,0.22), transparent 70%)',
        }}
      />
      <div className="container-edge relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo width={150} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              {t('tagline')}
            </p>
            <a
              href="#reservation"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-bright"
            >
              {t('reserve')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div>
            <h3 className="eyebrow not-italic">{t('openingHours')}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex flex-col">
                  <span className="text-cream/85">{h.day}</span>
                  <span className="tabular text-cream/50">{h.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow not-italic">{t('visit')}</h3>
            <address className="mt-5 space-y-4 text-sm not-italic">
              <a
                href="https://maps.google.com/?q=Taste+Garden+Kortrijksestraat+276+Izegem"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 text-cream/70 transition-colors hover:text-ember"
              >
                <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ember" />
                <span className="whitespace-pre-line">{address}</span>
              </a>
              <a
                href="tel:+3251303888"
                className="flex items-center gap-2.5 text-cream/70 transition-colors hover:text-ember"
              >
                <Phone className="h-[18px] w-[18px] shrink-0 text-ember" />
                <span className="tabular">{p('phone1')}</span>
              </a>
            </address>
          </div>

          <div>
            <h3 className="eyebrow not-italic">{t('follow')}</h3>
            <a
              href="https://www.facebook.com/Taste-Garden-Izegem"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-cream/15 bg-white/[0.03] px-4 py-2.5 text-sm text-cream/80 transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Facebook className="h-[18px] w-[18px]" />
              {t('facebook')}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-5 border-t border-cream/10 pt-7 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Taste Garden — {t('credit')}. {t('rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
