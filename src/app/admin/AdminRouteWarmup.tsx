'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_ROUTES = ['/admin', '/admin/banner', '/admin/content'] as const;

export function AdminRouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;

    if (connection?.saveData) return;

    const warmRoutes = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      for (const route of ADMIN_ROUTES) {
        router.prefetch(route);
      }
    };

    const warmWhenVisible = () => {
      if (document.visibilityState === 'visible') warmRoutes();
    };

    const timeoutId = window.setTimeout(warmRoutes, 120);
    document.addEventListener('visibilitychange', warmWhenVisible, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', warmWhenVisible);
    };
  }, [router]);

  return null;
}
