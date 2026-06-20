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

/**
 * Lightweight rising-ember / spark field rendered on a canvas with additive glow.
 * Evokes the warm light of teppanyaki embers and lanterns. Renders nothing when
 * the user prefers reduced motion, and scales particle count down on mobile.
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
    // Desktop / precise-pointer only — keep mid-range phones fast.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    const count = Math.round(28 * density);
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
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        e.phase += 0.01;
        e.y += e.vy;
        e.x += e.vx + Math.sin(e.phase) * e.sway * 0.4;
        if (e.y < -10) reset(e);

        const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        const color = e.warm ? '216, 162, 74' : '224, 59, 51';
        grd.addColorStop(0, `rgba(${color}, ${e.alpha})`);
        grd.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      running = document.visibilityState === 'visible';
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
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
