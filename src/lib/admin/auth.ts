import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase/server';

/**
 * Returns the signed-in user IF they are an allow-listed admin, else null.
 * `is_admin()` runs in the database and checks the admin_allowlist against the
 * verified JWT email — the browser can never fake this.
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return isAdmin === true ? user : null;
}

/** Guard for protected admin pages — redirects to the login screen when not an admin. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}
