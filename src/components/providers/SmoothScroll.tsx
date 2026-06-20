'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Wires Lenis smooth-scroll into GSAP's ScrollTrigger and installs a single,
 * performance-friendly reveal batch for every `[data-reveal]` element on the page.
 *
 * Motion is fully gated behind `prefers-reduced-motion`: reduced-motion users get
 * native scrolling and instantly-visible content (no hidden initial state).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { motion } = context.conditions as {
          motion: boolean;
          reduced: boolean;
        };

        if (!motion) {
          // Reduced motion: ensure everything is visible, skip Lenis entirely.
          gsap.set('[data-reveal]', { opacity: 1, y: 0 });
          ScrollTrigger.refresh();
          return;
        }

        // Smooth scrolling
        const lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.6,
        });

        lenis.on('scroll', ScrollTrigger.update);

        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Global staggered reveal — set hidden state via JS so no-JS users still see content.
        const revealEls = gsap.utils.toArray<HTMLElement>('[data-reveal]');
        gsap.set(revealEls, { opacity: 0, y: 36 });

        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 86%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              stagger: 0.09,
              overwrite: true,
            }),
        });

        ScrollTrigger.refresh();

        // Glide to in-page anchors via Lenis, offset for the fixed header.
        const onAnchorClick = (event: MouseEvent) => {
          const target = (event.target as HTMLElement)?.closest(
            'a[href^="#"]',
          ) as HTMLAnchorElement | null;
          if (!target) return;
          const id = target.getAttribute('href');
          if (!id || id === '#') return;
          const el = document.querySelector(id);
          if (!el) return;
          event.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -76, duration: 1.2 });
        };
        document.addEventListener('click', onAnchorClick);

        return () => {
          gsap.ticker.remove(tick);
          document.removeEventListener('click', onAnchorClick);
          lenis.destroy();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
