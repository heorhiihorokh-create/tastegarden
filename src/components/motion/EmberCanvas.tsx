'use client';

import { useEffect, useRef } from 'react';

type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  sway: number;
  phase: number;
  warm: boolean;
  alpha: number;
};

// Pre-rendered glow sprite: identical radial gradient to the old per-frame
// createRadialGradient, but built once and stamped with drawImage. This removes
// thousands of gradient allocations per second (the main GC/jank source here).
const SPRITE_SIZE = 96;

function makeGlowSprite(color: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const g = sprite.getContext('2d');
  if (g) {
    const half = SPRITE_SIZE / 2;
    const grd = g.createRadialGradient(half, half, 0, half, half, half);
    grd.addColorStop(0, `rgba(${color}, 1)`);
    grd.addColorStop(1, `rgba(${color}, 0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  }
  return sprite;
}

/**
 * Lightweight rising-ember / spark field rendered on a canvas with additive glow.
 * Evokes the warm light of teppanyaki embers and lanterns. Renders nothing when
 * the user prefers reduced motion, and scales particle count down on mobile.
 * The animation loop only runs while the canvas is on screen and the tab is
 * visible — scrolling the rest of the page costs nothing.
 */
export function EmberCanvas({
  className,
  density = 1,
}: {
  className?: string;
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Skip only on small/mobile screens for performance — render on any pointer type
    // (a touchscreen laptop reports a coarse pointer but should still show embers).
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const warmSprite = makeGlowSprite('216, 162, 74');
    const crimsonSprite = makeGlowSprite('224, 59, 51');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let animating = false;
    let inView = true;
    let pageVisible = document.visibilityState === 'visible';

    const count = Math.round(44 * density);
    const embers: Ember[] = [];

    const reset = (e: Ember, initial = false): Ember => {
      e.x = Math.random() * w;
      e.y = initial ? Math.random() * h : h + Math.random() * 40;
      e.r = Math.random() * 1.8 + 0.5;
      e.vy = -(Math.random() * 0.45 + 0.15);
      e.vx = (Math.random() - 0.5) * 0.15;
      e.sway = Math.random() * 0.6 + 0.2;
      e.phase = Math.random() * Math.PI * 2;
      e.warm = Math.random() < 0.62;
      e.alpha = Math.random() * 0.5 + 0.25;
      return e;
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    for (let i = 0; i < count; i++) {
      embers.push(
        reset(
          { x: 0, y: 0, r: 0, vx: 0, vy: 0, sway: 0, phase: 0, warm: true, alpha: 0 },
          true,
        ),
      );
    }

    const draw = () => {
      if (!animating) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        e.phase += 0.01;
        e.y += e.vy;
        e.x += e.vx + Math.sin(e.phase) * e.sway * 0.4;
        if (e.y < -10) reset(e);

        const glow = e.r * 6;
        ctx.globalAlpha = e.alpha;
        ctx.drawImage(
          e.warm ? warmSprite : crimsonSprite,
          e.x - glow,
          e.y - glow,
          glow * 2,
          glow * 2,
        );
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };

    const syncRunning = () => {
      const shouldRun = inView && pageVisible;
      if (shouldRun && !animating) {
        animating = true;
        raf = requestAnimationFrame(draw);
      } else if (!shouldRun && animating) {
        animating = false;
        cancelAnimationFrame(raf);
      }
    };

    syncRunning();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      pageVisible = document.visibilityState === 'visible';
      syncRunning();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncRunning();
      },
      { rootMargin: '80px' },
    );
    io.observe(canvas);

    return () => {
      animating = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
