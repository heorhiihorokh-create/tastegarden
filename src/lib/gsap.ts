'use client';

import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type GsapScope = Element | RefObject<Element | null>;
type GsapConfig = {
  scope?: GsapScope | null;
  dependencies?: readonly unknown[];
  revertOnUpdate?: boolean;
};

function resolveScope(scope?: GsapScope | null) {
  if (!scope) return undefined;
  if ('current' in scope) return scope.current ?? undefined;
  return scope;
}

/**
 * GSAP's official React hook uses a layout effect. That is great for many apps,
 * but here it mutates SSR markup before React finishes hydration, which creates
 * noisy hydration warnings in Next dev and can make transitions feel janky.
 *
 * This tiny wrapper intentionally runs animations after hydration via
 * `useEffect`, while still scoping selectors and reverting timelines on unmount.
 */
function useGSAP(callback: () => void | (() => void), config?: GsapConfig) {
  useEffect(() => {
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = callback();
    }, resolveScope(config?.scope));

    return () => {
      cleanup?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, config?.dependencies ?? []);
}

export { gsap, ScrollTrigger, useGSAP };
