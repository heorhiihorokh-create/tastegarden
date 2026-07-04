import { getSupabaseAnon, supabaseConfigured, withTimeout } from '@/lib/supabase/server';
import { withPublicCache } from '@/lib/publicCache';
import {
  DEFAULT_SCHEDULE,
  OPENING_SCHEDULE_KEY,
  OPENING_SCHEDULE_LOCALE,
  parseScheduleConfig,
  type ScheduleConfig,
} from '@/lib/scheduleConfig';

/**
 * Public read of the owner-editable opening schedule. Served through the same
 * in-process micro-cache as the banner (admin saves invalidate it), so visitor
 * renders don't block on a DB round trip. Fail-safe to the default schedule so
 * the reservation form always works even if the DB is unreachable.
 */
export function getScheduleConfig(): Promise<ScheduleConfig> {
  if (!supabaseConfigured()) return Promise.resolve(DEFAULT_SCHEDULE);
  return withPublicCache('opening-schedule', loadScheduleConfig);
}

async function loadScheduleConfig(): Promise<ScheduleConfig> {
  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await withTimeout(
      supabase
        .from('content_overrides')
        .select('value')
        .eq('locale', OPENING_SCHEDULE_LOCALE)
        .eq('key', OPENING_SCHEDULE_KEY)
        .maybeSingle(),
    );
    if (error || !data) return DEFAULT_SCHEDULE;
    return parseScheduleConfig((data as { value: string | null }).value);
  } catch {
    return DEFAULT_SCHEDULE;
  }
}
