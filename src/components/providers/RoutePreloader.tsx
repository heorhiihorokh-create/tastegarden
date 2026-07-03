'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { BrandLoader } from '@/components/ui/BrandLoader';

type LoaderPhase = 'idle' | 'entering' | 'leaving';

const SHOW_DELAY_MS = 170;
const MIN_VISIBLE_MS = 420;
const EXIT_MS = 360;
const SAFETY_HIDE_MS = 6500;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return false;
  if (/^(mailto:|tel:|javascript:|blob:|data:|sms:)/i.test(href)) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    const current = new URL(window.location.href);
    const sameDocument =
      url.pathname === current.pathname &&
      url.search === current.search &&
      Boolean(url.hash) &&
      url.hash !== current.hash;

    return !sameDocument;
  } catch {
    return false;
  }
}

function clearTimer(timer: MutableRefObject<number | null>) {
  if (!timer.current) return;
  window.clearTimeout(timer.current);
  timer.current = null;
}

export function RoutePreloader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const disabled = pathname?.startsWith('/admin') ?? false;
  const [phase, setPhase] = useState<LoaderPhase>('idle');
  const showTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const shownAt = useRef(0);
  const hasMounted = useRef(false);

  const clearTimers = useCallback(() => {
    clearTimer(showTimer);
    clearTimer(exitTimer);
    clearTimer(safetyTimer);
  }, []);

  const hide = useCallback(() => {
    clearTimer(showTimer);
    clearTimer(safetyTimer);

    setPhase((current) => {
      if (current === 'idle') return current;

      const elapsed = shownAt.current ? Date.now() - shownAt.current : MIN_VISIBLE_MS;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      clearTimer(exitTimer);
      exitTimer.current = window.setTimeout(() => {
        setPhase('leaving');
        exitTimer.current = window.setTimeout(() => {
          setPhase('idle');
          shownAt.current = 0;
          exitTimer.current = null;
        }, EXIT_MS);
      }, wait);

      return current;
    });
  }, []);

  const show = useCallback(() => {
    if (disabled) return;

    clearTimers();

    showTimer.current = window.setTimeout(() => {
      shownAt.current = Date.now();
      setPhase('entering');
    }, SHOW_DELAY_MS);

    safetyTimer.current = window.setTimeout(hide, SAFETY_HIDE_MS);
  }, [clearTimers, disabled, hide]);

  useEffect(() => {
    if (disabled) {
      clearTimers();
      shownAt.current = 0;
      setPhase('idle');
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    hide();
  }, [clearTimers, disabled, hide, routeKey]);

  useEffect(() => {
    if (disabled) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || !isInternalNavigation(anchor)) return;

      show();
    };

    const onSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      if (target.dataset.routeLoader === 'off') return;

      const isServerAction = Boolean(
        target.querySelector('input[name="$ACTION_KEY"], input[name^="$ACTION_"], input[name^="$ACTION_REF_"]'),
      );
      if (isServerAction) return;

      const method = (target.getAttribute('method') || target.method || 'get').toLowerCase();
      const action = target.getAttribute('action') || window.location.href;
      if (method !== 'get' || /^(mailto:|tel:|javascript:)/i.test(action)) return;

      show();
    };

    const finishAfterHistoryChange = () => {
      window.requestAnimationFrame(hide);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args);
      finishAfterHistoryChange();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      finishAfterHistoryChange();
      return result;
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit);
    window.addEventListener('tastegarden-route-pending', show);
    window.addEventListener('pageshow', hide);
    window.addEventListener('popstate', finishAfterHistoryChange);

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit);
      window.removeEventListener('tastegarden-route-pending', show);
      window.removeEventListener('pageshow', hide);
      window.removeEventListener('popstate', finishAfterHistoryChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, [clearTimers, disabled, hide, show]);

  if (disabled || phase === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className={`route-loader route-loader--${phase} fixed inset-0 z-[120] pointer-events-none`}
    >
      <BrandLoader />
    </div>
  );
}
