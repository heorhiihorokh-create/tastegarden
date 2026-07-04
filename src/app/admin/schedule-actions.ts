'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { invalidatePublicContentCache } from '@/lib/publicCache';
import {
  OPENING_SCHEDULE_KEY,
  OPENING_SCHEDULE_LOCALE,
  parseScheduleConfig,
  serializeScheduleConfig,
} from '@/lib/scheduleConfig';

const LOCALES = ['nl', 'fr', 'en'];

/**
 * Persist the owner-edited opening schedule as one JSON blob in
 * content_overrides (same storage trick as the holiday block window — no schema
 * migration). Input is sanitized by parseScheduleConfig before saving.
 */
export async function saveSchedule(formData: FormData) {
  await requireAdmin();

  const raw = String(formData.get('config') ?? '');
  const value = serializeScheduleConfig(parseScheduleConfig(raw));

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from('content_overrides').upsert({
    key: OPENING_SCHEDULE_KEY,
    locale: OPENING_SCHEDULE_LOCALE,
    value,
    updated_at: new Date().toISOString(),
    updated_by: user?.email ?? null,
  });

  try {
    await supabase.from('audit_log').insert({ actor: user?.email ?? null, action: 'schedule_update', detail: {} });
  } catch {
    /* logging must never block the save */
  }

  invalidatePublicContentCache();
  for (const locale of LOCALES) revalidatePath(`/${locale}`);
  revalidatePath('/admin/hours');
}
