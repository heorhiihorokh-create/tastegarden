import type { SVGProps } from 'react';

type EmblemVariant =
  | 'concept'
  | 'kitchens'
  | 'signature'
  | 'takeaway'
  | 'formules'
  | 'ambiance'
  | 'practical'
  | 'reservation';

type SectionEmblemProps = {
  variant: EmblemVariant;
  align?: 'left' | 'center';
  className?: string;
  reveal?: boolean;
};

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.35,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function EmblemIcon({ variant }: { variant: EmblemVariant }) {
  if (variant === 'concept') {
    return (
      <svg {...iconProps}>
        <path d="M7 19.5h18M9.5 19.5c.7 4.2 3 6.3 6.5 6.3s5.8-2.1 6.5-6.3" />
        <path d="M16 17V8.3M16 12.5c-3.8 0-5.8-1.7-6.3-4.8 3.8-.2 5.9 1.4 6.3 4.8Z" />
        <path d="M16 10.2c3.5 0 5.4-1.5 5.8-4.3-3.5-.2-5.4 1.2-5.8 4.3Z" />
      </svg>
    );
  }

  if (variant === 'kitchens') {
    return (
      <svg {...iconProps}>
        <path d="M7.5 19.2h17M9.2 19.2c.7 4.1 3.2 6.2 6.8 6.2s6.1-2.1 6.8-6.2" />
        <path d="M16 6.2c-2.4 2.2-2.4 4.5 0 6.7 2.4-2.2 2.4-4.5 0-6.7Z" />
        <path d="M11.4 10.6c-.8 2.2-.2 3.9 1.7 5.2M20.6 10.6c.8 2.2.2 3.9-1.7 5.2" />
      </svg>
    );
  }

  if (variant === 'signature') {
    return (
      <svg {...iconProps}>
        <path d="M6.8 21.3h18.4M9.2 21.3c.9 3 3.1 4.5 6.8 4.5s5.9-1.5 6.8-4.5" />
        <path d="m10 7 12 10M12.7 5.8l11 9.2" />
        <path d="M7.8 18.1c1.8-2.2 4.5-3.3 8.2-3.3" />
      </svg>
    );
  }

  if (variant === 'takeaway') {
    return (
      <svg {...iconProps}>
        <path d="M8.2 12.2h15.6l-1.3 13.1h-13L8.2 12.2Z" />
        <path d="M10.6 12.2 13 7.3h6l2.4 4.9M12 16.2h8M13 20h6" />
        <path d="M13.2 7.3c.6-2 1.5-3.1 2.8-3.1s2.2 1.1 2.8 3.1" />
      </svg>
    );
  }

  if (variant === 'formules') {
    return (
      <svg {...iconProps}>
        <path d="M8.2 8.5c3.2-.7 5.8 0 7.8 2.1 2-2.1 4.6-2.8 7.8-2.1v15.2c-3.2-.7-5.8 0-7.8 2.1-2-2.1-4.6-2.8-7.8-2.1V8.5Z" />
        <path d="M16 10.6v15.2M11 13.2h2.5M18.5 13.2H21M11 17h2.5M18.5 17H21" />
      </svg>
    );
  }

  if (variant === 'ambiance') {
    return (
      <svg {...iconProps}>
        <path d="M16 4.8v3M10.2 10.2h11.6l-1.2 11.2c-.2 2.5-1.8 4-4.6 4s-4.4-1.5-4.6-4l-1.2-11.2Z" />
        <path d="M12.2 14.1h7.6M12 21.2h8M13.2 8h5.6" />
      </svg>
    );
  }

  if (variant === 'practical') {
    return (
      <svg {...iconProps}>
        <circle cx="16" cy="16" r="10.2" />
        <circle cx="16" cy="16" r="2.1" />
        <path d="m18.1 13.9 3.2-5.2-5.2 3.2M13.9 18.1l-3.2 5.2 5.2-3.2" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M8.2 11.5h15.6v13H8.2v-13ZM11.2 7.5v6M20.8 7.5v6M8.2 16h15.6" />
      <path d="M13 20.3h6M16 18.3v4" />
    </svg>
  );
}

export function SectionEmblem({
  variant,
  align = 'left',
  className = '',
  reveal = true,
}: SectionEmblemProps) {
  return (
    <div
      data-reveal={reveal ? '' : undefined}
      aria-hidden="true"
      className={`section-emblem ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      <span />
      <EmblemIcon variant={variant} />
      <span />
    </div>
  );
}
