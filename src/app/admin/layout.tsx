import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const adminSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-admin-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Beheer — Taste Garden',
  description: 'Reservatiebeheer',
  robots: { index: false, follow: false },
};

/**
 * Separate back-office (/admin) layout, kept apart from the public marketing
 * site: no i18n and no smooth-scroll. The actual <html>/<body> and global CSS
 * live in app/layout.tsx; this wrapper scopes neutral admin styling.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${adminSans.variable} admin-root min-h-screen bg-zinc-100 text-zinc-900 antialiased`}>
      {children}
    </div>
  );
}
