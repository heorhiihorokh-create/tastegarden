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
          // Reduced motion: content is never hidden (the [data-reveal] hidden state
          // only exists inside a prefers-reduced-motion: no-preference media query),
          // so skip smooth scroll and reveal wiring entirely.
          ScrollTrigger.refresh();
          return;
        }

        // Smooth scroll ONLY on precise pointers (desktop). Touch devices keep
        // native, predictable scrolling — no momentum overshoot on phones.
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        let lenis: Lenis | null = null;
        let tick: ((time: number) => void) | null = null;

        if (finePointer) {
          lenis = new Lenis({
            duration: 0.9,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
            syncTouch: false,
          });
          lenis.on('scroll', ScrollTrigger.update);
          tick = (time: number) => lenis!.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
        }

        // Global staggered reveal — set hidden state via JS so no-JS users still see content.
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((el) => (el as HTMLElement).setAttribute('data-reveal-ready', ''));
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              stagger: 0.08,
              overwrite: true,
            });
          },
        });

        ScrollTrigger.refresh();

        // In-page anchors: glide via Lenis on desktop, native smooth scroll on touch.
        const onAnchorClick = (event: MouseEvent) => {
          const target = (event.target as HTMLElement)?.closest(
            'a[href^="#"]',
          ) as HTMLAnchorElement | null;
          if (!target) return;
          const id = target.getAttribute('href');
          if (!id || id === '#') return;
          const el = document.querySelector(id) as HTMLElement | null;
          if (!el) return;
          event.preventDefault();
          const isMenuCategory = el.hasAttribute('data-menu-category');
          const menuNav = document.querySelector<HTMLElement>('[data-menu-nav]');
          // Use the full pre-compaction height. The scroll-triggered shrink then
          // removes exactly that height delta and leaves a stable 20px gap.
          const menuOffset = menuNav
            ? menuNav.getBoundingClientRect().height + (finePointer ? 98 : 92)
            : 160;
          const anchorOffset = isMenuCategory ? menuOffset : 76;
          if (lenis) {
            lenis.scrollTo(el, {
              offset: -anchorOffset,
              duration: 1.1,
            });
          } else {
            const top =
              el.getBoundingClientRect().top + window.scrollY - anchorOffset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        };
        document.addEventListener('click', onAnchorClick);

        return () => {
          if (tick) gsap.ticker.remove(tick);
          document.removeEventListener('click', onAnchorClick);
          lenis?.destroy();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
