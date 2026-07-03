import { unstable_noStore as noStore } from 'next/cache';
import { getSupabaseAnon, supabaseConfigured, withTimeout } from '@/lib/supabase/server';
import { withPublicCache } from '@/lib/publicCache';
import { holidayAnnouncementBlocksReservations } from '@/lib/holidayCopy';
import {
  EMPTY_HOLIDAY_BLOCK_WINDOW,
  HOLIDAY_BLOCK_SETTING_KEYS,
  HOLIDAY_BLOCK_SETTINGS_LOCALE,
  holidayBlockWindowFromRows,
  type HolidayBlockWindow,
} from '@/lib/holidayBlockWindow';

export type Locale = 'nl' | 'fr' | 'en';
export type Season = 'summer' | 'autumn' | 'winter' | 'spring';

export type BannerStatus = {
  bookingsClosed: boolean;
  message: Record<Locale, string>;
  holiday: {
    active: boolean;
    blocksReservations: boolean;
    blockWindow: HolidayBlockWindow;
    theme: Season;
    title: Record<Locale, string>;
    message: Record<Locale, string>;
  };
};

const FALLBACK: BannerStatus = {
  bookingsClosed: false,
  message: { nl: '', fr: '', en: '' },
  holiday: {
    active: false,
    blocksReservations: false,
    blockWindow: EMPTY_HOLIDAY_BLOCK_WINDOW,
    theme: 'summer',
    title: { nl: '', fr: '', en: '' },
    message: { nl: '', fr: '', en: '' },
  },
};

const SEASONS: Season[] = ['summer', 'autumn', 'winter', 'spring'];

/**
 * Public booking-status + banner + holiday-announcement, read from `settings`.
 * This must never use a stale Next fetch cache: owners expect admin changes
 * (reservations closed/open + seasonal announcement) to be visible immediately.
 * Admin saves invalidate the in-process micro-cache, so edits still show up on
 * the next request; the cache only spares visitors a DB round trip per view.
 */
export async function getBannerStatus(): Promise<BannerStatus> {
  noStore();

  if (!supabaseConfigured()) return FALLBACK;
  return withPublicCache('banner-status', fetchBannerStatus);
}

async function fetchBannerStatus(): Promise<BannerStatus> {
  try {
    const supabase = getSupabaseAnon();
    const [settingsResult, windowResult] = await withTimeout(
      Promise.all([
        supabase
          .from('settings')
          .select(
            'bookings_closed, closed_message_nl, closed_message_fr, closed_message_en, holiday_active, holiday_theme, holiday_title_nl, holiday_title_fr, holiday_title_en, holiday_message_nl, holiday_message_fr, holiday_message_en',
          )
          .eq('id', 1)
          .single(),
        supabase
          .from('content_overrides')
          .select('key, value')
          .eq('locale', HOLIDAY_BLOCK_SETTINGS_LOCALE)
          .in('key', [...HOLIDAY_BLOCK_SETTING_KEYS]),
      ]),
    );
    const { data, error } = settingsResult;
    if (error || !data) return FALLBACK;

    const theme = (SEASONS as string[]).includes(data.holiday_theme)
      ? (data.holiday_theme as Season)
      : 'summer';

    const holidayActive = Boolean(data.holiday_active);
    const blockWindow = windowResult.error
      ? EMPTY_HOLIDAY_BLOCK_WINDOW
      : holidayBlockWindowFromRows(windowResult.data);

    return {
      bookingsClosed: Boolean(data.bookings_closed),
      message: {
        nl: data.closed_message_nl ?? '',
        fr: data.closed_message_fr ?? '',
        en: data.closed_message_en ?? '',
      },
      holiday: {
        active: holidayActive,
        blocksReservations: holidayAnnouncementBlocksReservations({ active: holidayActive, blockWindow }),
        blockWindow,
        theme,
        title: {
          nl: data.holiday_title_nl ?? '',
          fr: data.holiday_title_fr ?? '',
          en: data.holiday_title_en ?? '',
        },
        message: {
          nl: data.holiday_message_nl ?? '',
          fr: data.holiday_message_fr ?? '',
          en: data.holiday_message_en ?? '',
        },
      },
    };
  } catch {
    return FALLBACK;
  }
}
