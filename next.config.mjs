import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isPortfolioDemo = process.env.PORTFOLIO_DEMO === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  ...(isPortfolioDemo
    ? {
        output: 'export',
        basePath: '/demos/tastegarden',
        assetPrefix: '/demos/tastegarden',
        trailingSlash: true,
      }
    : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: isPortfolioDemo,
  },
  ...(!isPortfolioDemo
    ? {
        async redirects() {
          return [{ source: '/', destination: '/nl', permanent: false }];
        },
        // Baseline security headers (OWASP API8 — no strict CSP yet to avoid
        // breaking the inline theme script; add a nonce-based CSP after testing).
        async headers() {
          return [
            {
              source: '/:path*',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ],
            },
          ];
        },
      }
    : {}),
};

export default withNextIntl(nextConfig);
