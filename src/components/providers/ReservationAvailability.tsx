'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Phone } from '@/components/ui/Icons';

export type ReservationUnavailableReason = 'manual' | 'holiday' | null;
type BlockedAction = 'reserve' | 'call';

type Notice = {
  id: number;
  action: BlockedAction;
  title: string;
  body: string;
};

const AUTO_HIDE_MS = 6200;
const EXIT_MS = 420;

type ReservationAvailabilityContextValue = {
  unavailableReason: ReservationUnavailableReason;
  isUnavailable: boolean;
  notifyBlockedAction: (action: BlockedAction) => boolean;
};

const ReservationAvailabilityContext = createContext<ReservationAvailabilityContextValue>({
  unavailableReason: null,
  isUnavailable: false,
  notifyBlockedAction: () => false,
});

export function ReservationAvailabilityProvider({
  reason,
  children,
}: {
  reason: ReservationUnavailableReason;
  children: ReactNode;
}) {
  const t = useTranslations('availability');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const removeTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (removeTimer.current) {
      window.clearTimeout(removeTimer.current);
      removeTimer.current = null;
    }
  }, []);

  const buildNotice = useCallback(
    (action: BlockedAction): Notice => {
      if (reason === 'holiday') {
        return {
          id: Date.now(),
          action,
          title: t('holidayTitle'),
          body: action === 'call' ? t('holidayCallBody') : t('holidayReserveBody'),
        };
      }

      return {
        id: Date.now(),
        action,
        title: t('manualTitle'),
        body: action === 'call' ? t('manualCallBody') : t('manualReserveBody'),
      };
    },
    [reason, t],
  );

  const dismissNotice = useCallback(() => {
    if (!notice || isExiting) return;
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    setIsExiting(true);
    removeTimer.current = window.setTimeout(() => {
      setNotice(null);
      setIsExiting(false);
      removeTimer.current = null;
    }, EXIT_MS);
  }, [isExiting, notice]);

  const notifyBlockedAction = useCallback(
    (action: BlockedAction) => {
      if (!reason) return false;
      clearTimers();
      setIsExiting(false);
      setNotice(buildNotice(action));
      return true;
    },
    [buildNotice, clearTimers, reason],
  );

  useEffect(() => {
    if (!notice || isExiting) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(dismissNotice, AUTO_HIDE_MS);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [dismissNotice, isExiting, notice]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!reason) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href') ?? '';
      const isPhone = href.startsWith('tel:');
      const isReservation = href === '#reservation' || href.endsWith('/#reservation');
      if (!isPhone && !isReservation) return;

      event.preventDefault();
      notifyBlockedAction(isPhone ? 'call' : 'reserve');

      if (isReservation) {
        window.setTimeout(() => {
          document.getElementById('reservation')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 40);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [notifyBlockedAction, reason]);

  const value = useMemo<ReservationAvailabilityContextValue>(
    () => ({
      unavailableReason: reason,
      isUnavailable: Boolean(reason),
      notifyBlockedAction,
    }),
    [notifyBlockedAction, reason],
  );

  return (
    <ReservationAvailabilityContext.Provider value={value}>
      {children}
      {notice && (
        <div
          key={notice.id}
          role="alert"
          aria-live="assertive"
          data-state={isExiting ? 'leaving' : 'entering'}
          className={`availability-toast fixed inset-x-3 bottom-[calc(5.6rem+env(safe-area-inset-bottom))] z-[90] sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-[min(420px,calc(100vw-3rem))] ${
            isExiting ? 'availability-toast--leaving' : 'availability-toast--entering'
          }`}
        >
          <div className="relative isolate overflow-hidden rounded-[1.35rem] border border-ember/35 bg-ink-raise/95 p-4 text-cream shadow-[0_26px_70px_-34px_rgba(0,0,0,0.82)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgb(var(--ember)/0.18),transparent_14rem),linear-gradient(135deg,rgb(var(--crimson)/0.09),transparent_52%)]" />
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ember/35 bg-ember/13 text-ember shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
                {notice.action === 'call' ? (
                  <Phone className="h-[18px] w-[18px]" />
                ) : (
                  <Clock className="h-[18px] w-[18px]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-ember">
                  {t('label')}
                </p>
                <p className="mt-1 font-display text-xl leading-tight text-cream">
                  {notice.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-cream/76">
                  {notice.body}
                </p>
              </div>
              <button
                type="button"
                onClick={dismissNotice}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream/10 text-lg leading-none text-cream/60 transition-colors hover:border-ember/45 hover:text-ember"
                aria-label={t('close')}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </ReservationAvailabilityContext.Provider>
  );
}

export function useReservationAvailability() {
  return useContext(ReservationAvailabilityContext);
}
