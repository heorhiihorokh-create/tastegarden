'use client';

import { useEffect, useState } from 'react';
import { BrandLoader } from '@/components/ui/BrandLoader';

type InitialLoaderPhase = 'visible' | 'leaving' | 'gone';

// Mount = hydration finished: the page below is painted and interactive, and the
// hero has its own blur placeholder. Waiting for window "load" here would stall
// the whole site on every below-the-fold image, so the loader only holds a short
// brand beat and gets out of the way.
const MIN_VISIBLE_MS = 500;
const EXIT_MS = 360;

export function InitialPageLoader() {
  const [phase, setPhase] = useState<InitialLoaderPhase>('visible');

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setPhase('leaving'), MIN_VISIBLE_MS);
    const goneTimer = window.setTimeout(() => setPhase('gone'), MIN_VISIBLE_MS + EXIT_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`initial-loader initial-loader--${phase}`}
      aria-hidden="true"
    >
      <BrandLoader screen />
    </div>
  );
}
