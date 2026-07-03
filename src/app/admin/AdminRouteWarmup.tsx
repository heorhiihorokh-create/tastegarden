'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_ROUTES = ['/admin', '/admin/banner', '/admin/content'] as const;

export function AdminRouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const queue = [...ADMIN_ROUTES];
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;

    if (connection?.saveData) return;

    const warmNext = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      const route = queue.shift();
      if (!route) return;

      router.prefetch(route);
      if (queue.length) window.setTimeout(warmNext, 420);
    };

    const hasIdleCallback = typeof window.requestIdleCallback === 'function';
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (hasIdleCallback) {
      idleId = window.requestIdleCallback(warmNext, { timeout: 2200 });
    } else {
      timeoutId = globalThis.setTimeout(warmNext, 1300);
    }

    return () => {
      cancelled = true;
      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, [router]);

  return null;
}
