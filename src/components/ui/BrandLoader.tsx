'use client';

export function BrandLoader({
  className = '',
  screen = false,
}: {
  className?: string;
  screen?: boolean;
}) {
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
