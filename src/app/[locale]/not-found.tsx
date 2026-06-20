import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  const t = useTranslations('nav');
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo width={150} />
      <p className="font-display text-6xl text-cream">404</p>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-crimson-bright"
      >
        {t('reserve')}
      </a>
    </main>
  );
}
