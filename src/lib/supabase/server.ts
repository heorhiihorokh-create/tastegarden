import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase access — SERVER ONLY.
 *
 * Keys are read from server-only env (no NEXT_PUBLIC_ prefix), so they never
 * ship to the browser. All database access happens on the server; the browser
 * never talks to Supabase directly. This keeps the attack surface minimal and
 * works without Next.js Edge middleware (which is disabled in this host).
 */
const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

/** True when the DB is wired up (lets the app degrade gracefully if env is missing). */
export function supabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Cookie-bound client that carries the signed-in admin's session.
 * Use inside the admin area, auth actions, and any authorized mutation —
 * Row Level Security then enforces admin-only access at the database.
 */
export async function getSupabaseServer() {
  if (!url || !anonKey) throw new Error('Supabase env not configured (SUPABASE_URL / SUPABASE_ANON_KEY)');
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list: { name: string; value: string; options?: unknown }[]) {
        try {
          const set = cookieStore.set as (name: string, value: string, options?: unknown) => void;
          list.forEach(({ name, value, options }) => set(name, value, options));
        } catch {
          // Called from a Server Component (read-only cookie store) — safe to ignore;
          // session cookies are written in Server Actions / Route Handlers.
        }
      },
    },
  });
}

/**
 * Sessionless anon client for public server work: reading the public settings
 * (banner) and inserting a reservation (RLS only permits INSERT of a pending row).
 */
export function getSupabaseAnon() {
  if (!url || !anonKey) throw new Error('Supabase env not configured (SUPABASE_URL / SUPABASE_ANON_KEY)');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

/**
 * Race a (possibly hanging) DB call against a deadline so a slow/unreachable
 * database can never freeze server rendering. On timeout the caller's try/catch
 * falls back to safe defaults. The timer is always cleared (no leak / no
 * unhandled rejection).
 */
export function withTimeout<T>(p: PromiseLike<T>, ms = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('db_timeout')), ms);
  });
  return Promise.race([Promise.resolve(p) as Promise<T>, timeout]).finally(() => clearTimeout(timer));
}
