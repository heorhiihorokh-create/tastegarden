import Image from 'next/image';
import logo from '../../../public/images/logo.png';

export function Logo({
  className,
  priority = false,
  width = 132,
}: {
  className?: string;
  priority?: boolean;
  width?: number;
}) {
  return (
    <Image
      src={logo}
      alt="Taste Garden — Wereld Keuken"
      width={width}
      height={Math.round((width * logo.height) / logo.width)}
      priority={priority}
      className={['brand-logo-boost', className].filter(Boolean).join(' ')}
    />
  );
}
