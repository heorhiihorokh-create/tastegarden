'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Phone } from '@/components/ui/Icons';

export function StickyMobileBar() {
  const t = useTranslations('sticky');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-all duration-500 ease-smooth ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-2xl border border-cream/10 bg-ink/85 p-2 shadow-lift backdrop-blur-xl">
        <a
          href="tel:+3251303888"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-cream/15 bg-white/[0.03] text-sm font-medium text-cream"
        >
          <Phone className="h-[18px] w-[18px] text-ember" />
          {t('call')}
        </a>
        <a
          href="#reservation"
          className="flex h-12 flex-[1.3] items-center justify-center gap-2 rounded-xl bg-crimson text-sm font-semibold text-[#f4ece4]"
        >
          {t('reserve')}
        </a>
      </div>
    </div>
  );
}
