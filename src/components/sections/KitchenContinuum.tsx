'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/lib/useTheme';
import cloudPattern from '../../../public/images/kitchens/cloud-pattern.webp';

export function KitchenContinuum({ children }: { children: ReactNode }) {
  const isLight = useTheme() === 'light';

  return (
    <div
      data-theme={isLight ? undefined : 'dark'}
      className="relative isolate overflow-hidden bg-ink transition-colors duration-500"
    >
      <div
        className="dark-only pointer-events-none absolute -inset-x-[18%] inset-y-0 z-0 opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage: `url(${cloudPattern.src})`,
          backgroundPosition: 'center top',
          backgroundRepeat: 'repeat-y',
          backgroundSize: 'clamp(980px, 112vw, 1760px) auto',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 8%, black 25%, black 90%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 8%, black 25%, black 90%, transparent 100%)',
        }}
      />
      <div
        className="light-only pointer-events-none absolute -inset-x-[18%] inset-y-0 z-0 opacity-[0.055] mix-blend-multiply"
        style={{
          backgroundImage: `url(${cloudPattern.src})`,
          backgroundPosition: 'center top',
          backgroundRepeat: 'repeat-y',
          backgroundSize: 'clamp(980px, 112vw, 1760px) auto',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 5%, black 20%, black 92%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 5%, black 20%, black 92%, transparent 100%)',
        }}
      />
      <div className="dark-only kitchen-ambient-glow kitchen-ambient-glow--warm pointer-events-none absolute z-0" />
      <div className="dark-only kitchen-ambient-glow kitchen-ambient-glow--gold pointer-events-none absolute z-0" />
      <div className="light-only pointer-events-none absolute left-[-18%] top-[18%] z-0 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(216,162,74,0.12),transparent_68%)] blur-3xl" />
      <div className="light-only pointer-events-none absolute right-[-16%] top-[52%] z-0 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(193,39,45,0.055),transparent_70%)] blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
