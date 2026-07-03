import Image from 'next/image';
import mark from '../../../public/images/logo-mark.png';

// Navbar emblem — the gold chef/gate mark only, without the red wordmark text.
export function LogoMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={mark}
      alt="Taste Garden"
      width={mark.width}
      height={mark.height}
      priority={priority}
      className={['brand-logo-boost', className].filter(Boolean).join(' ')}
    />
  );
}
