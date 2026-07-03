'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getDefaultValue } from '@/lib/content';
import { invalidatePublicContentCache } from '@/lib/publicCache';

const LOCALES = ['nl', 'fr', 'en'];

function revalidatePublic() {
  invalidatePublicContentCache();
  for (const l of LOCALES) revalidatePath(`/${l}`);
}

async function audit(action: string, detail: unknown) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert({ actor: user?.email ?? null, action, detail });
  } catch {
    /* never block */
  }
}

export async function saveContent(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get('key') ?? '').slice(0, 200);
  const locale = String(formData.get('locale') ?? '');
  const value = String(formData.get('value') ?? '').slice(0, 4000);
  if (!key || !LOCALES.includes(locale)) return;

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the new value equals the JSON default, drop the override (revert cleanly).
  const def = await getDefaultValue(locale, key);
  if (def !== null && def === value) {
    await supabase.from('content_overrides').delete().eq('key', key).eq('locale', locale);
  } else {
    await supabase.from('content_overrides').upsert({
      key,
      locale,
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.email ?? null,
    });
  }
  void audit('content_edit', { key, locale });
  revalidatePath('/admin/content');
  revalidatePublic();
}

export async function resetContent(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get('key') ?? '');
  const locale = String(formData.get('locale') ?? '');
  if (!key || !LOCALES.includes(locale)) return;

  const supabase = await getSupabaseServer();
  await supabase.from('content_overrides').delete().eq('key', key).eq('locale', locale);
  void audit('content_reset', { key, locale });
  revalidatePath('/admin/content');
  revalidatePublic();
}
