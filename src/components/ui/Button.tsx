import type { ReactNode } from 'react';
import { ArrowRight } from './Icons';

type Variant = 'primary' | 'ghost' | 'ember';

const variants: Record<Variant, string> = {
  primary:
    'bg-crimson text-cream hover:bg-crimson-bright shadow-[0_18px_40px_-18px_rgba(193,39,45,0.9)]',
  ember:
    'bg-ember text-ink hover:bg-ember-soft shadow-[0_18px_40px_-18px_rgba(216,162,74,0.8)]',
  ghost:
    'border border-cream/20 text-cream hover:border-ember/60 hover:text-ember bg-white/[0.02]',
};

export function Button({
  href,
  children,
  variant = 'primary',
  withArrow = false,
  className = '',
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.92rem] font-medium tracking-tight transition-all duration-300 ease-smooth hover:-translate-y-0.5 ${variants[variant]} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
      )}
    </a>
  );
}
