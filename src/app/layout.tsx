import { Fraunces, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RoutePreloader } from '@/components/providers/RoutePreloader';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  // 300 dropped: no font-light / weight-300 usage anywhere — one less preload.
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="bg-ink text-cream antialiased">
        {/* Apply saved theme before paint — avoids a light/dark flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{document.documentElement.classList.add('js');var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
          }}
        />
        <Suspense fallback={null}>
          <RoutePreloader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
