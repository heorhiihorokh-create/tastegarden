'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function CountUp({ value, prefix = '', suffix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        el.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      const proxy = { v: 0 };
      el.textContent = `${prefix}0${suffix}`;
      gsap.to(proxy, {
        v: value,
        duration: 1.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(proxy.v)}${suffix}`;
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
