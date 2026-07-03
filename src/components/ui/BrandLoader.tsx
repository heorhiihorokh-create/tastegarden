'use client';

import { useId } from 'react';

export function BrandLoader({
  className = '',
  screen = false,
}: {
  className?: string;
  screen?: boolean;
}) {
  const rawId = useId().replace(/:/g, '');
  const circleId = `brand-loader-orbit-${rawId}`;

  return (
    <div
      className={[
        'brand-loader',
        screen ? 'brand-loader--screen' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Taste Garden loading"
      role="status"
    >
      <div className="brand-loader__stage" aria-hidden="true">
        <span className="brand-loader__aura" />
        <span className="brand-loader__ring" />
        <svg
          className="brand-loader__orbit"
          viewBox="0 0 220 220"
          focusable="false"
        >
          <defs>
            <path
              id={circleId}
              d="M110 110 m -88 0 a 88 88 0 1 1 176 0 a 88 88 0 1 1 -176 0"
            />
          </defs>
          <text className="brand-loader__orbit-text">
            <textPath href={`#${circleId}`} startOffset="0%">
              Taste Garden • Taste Garden • Taste Garden •
            </textPath>
          </text>
        </svg>
        <img
          src="/images/taste-garden-logo-original.png"
          alt=""
          className="brand-loader__logo"
          draggable={false}
        />
      </div>
      <span className="sr-only">Taste Garden</span>
    </div>
  );
}
