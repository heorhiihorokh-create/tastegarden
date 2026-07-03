import { cache } from 'react';
import { getSupabaseAnon, supabaseConfigured, withTimeout } from '@/lib/supabase/server';
import { withPublicCache } from '@/lib/publicCache';

export type Messages = Record<string, unknown>;

/** Friendly Dutch names for each top-level message namespace (a "section"). */
const SECTION_LABELS: Record<string, string> = {
  meta: 'SEO / meta',
  nav: 'Navigatie',
  lang: 'Taal',
  cta: 'Knoppen (algemeen)',
  hero: 'Startsectie (hero)',
  concept: 'Concept',
  stations: 'Keukens',
  dishes: 'Afhaalmenu',
  formules: 'Formules',
  ambiance: 'Sfeer',
  practical: 'Praktisch / contact',
  reservation: 'Reserveren',
  footer: 'Footer',
};

/** Flatten string & number leaves into { 'a.b.0.c': value }. Booleans/null are skipped. */
export function flattenLeaves(
  obj: unknown,
  prefix = '',
  out: Record<string, string | number> = {},
): Record<string, string | number> {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'string' || typeof obj === 'number') {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenLeaves(v, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flattenLeaves(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/** Type-aware write: number leaves stay numbers, string leaves stay strings, else ignore. */
function setLeaf(root: Record<string, unknown>, path: string, value: string) {
  const parts = path.split('.');
  let node: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (node === null || typeof node !== 'object') return;
    node = (node as Record<string, unknown>)[parts[i]];
  }
  if (node === null || typeof node !== 'object') return;
  const holder = node as Record<string, unknown>;
  const last = parts[parts.length - 1];
  const current = holder[last];
  if (typeof current === 'number') {
    const n = Number(value);
    if (value.trim() !== '' && !Number.isNaN(n)) holder[last] = n;
  } else if (typeof current === 'string') {
    holder[last] = value;
  }
}

/** Merge DB overrides onto a deep clone of the default messages (returns the same shape). */
export function applyOverrides<T>(messages: T, overrides: Record<string, string>): T {
  if (!overrides || Object.keys(overrides).length === 0) return messages;
  const clone = JSON.parse(JSON.stringify(messages)) as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) setLeaf(clone, key, value);
  return clone as T;
}

async function loadContentOverrides(locale: string): Promise<Record<string, string>> {
  if (!supabaseConfigured()) return {};
  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await withTimeout(
      supabase.from('content_overrides').select('key, value').eq('locale', locale),
    );
    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const row of data as { key: string; value: string }[]) map[row.key] = row.value;
    return map;
  } catch {
    return {};
  }
}

/**
 * All overrides for a locale, keyed by dot-path. Fail-safe to {} so the site
 * never breaks. Served through the public micro-cache (admin saves invalidate
 * it), so visitor renders don't block on a DB round trip.
 */
export const getContentOverrides = cache((locale: string): Promise<Record<string, string>> =>
  withPublicCache(`content-overrides:${locale}`, () => loadContentOverrides(locale)),
);

/** Uncached read for the admin editor — must always reflect the latest save. */
const getContentOverridesFresh = cache(loadContentOverrides);

export type EditableField = {
  key: string;
  label: string;
  value: string;
  isOverride: boolean;
  isNumber: boolean;
  long: boolean;
};
export type EditableSection = { namespace: string; label: string; fields: EditableField[] };

/** Default messages for a locale (server import of the JSON bundle). */
async function loadDefaults(locale: string): Promise<Messages> {
  const mod = await import(`../../messages/${locale}.json`);
  return mod.default as Messages;
}

/** Everything the content editor needs: sections → fields, with current values. */
export async function getEditableSections(locale: string): Promise<EditableSection[]> {
  const defaults = await loadDefaults(locale);
  const flat = flattenLeaves(defaults);
  const overrides = await getContentOverridesFresh(locale);

  const groups = new Map<string, EditableField[]>();
  for (const [key, def] of Object.entries(flat)) {
    const ns = key.split('.')[0];
    const isOverride = key in overrides;
    const value = isOverride ? overrides[key] : String(def);
    const label = key.slice(ns.length + 1) || key;
    const field: EditableField = {
      key,
      label,
      value,
      isOverride,
      isNumber: typeof def === 'number',
      long: typeof def === 'string' && def.length > 60,
    };
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns)!.push(field);
  }

  const order = Object.keys(SECTION_LABELS);
  return [...groups.entries()]
    .map(([namespace, fields]) => ({ namespace, label: SECTION_LABELS[namespace] ?? namespace, fields }))
    .sort((a, b) => {
      const ia = order.indexOf(a.namespace);
      const ib = order.indexOf(b.namespace);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
}

/** The dot-path default value for one locale (used to revert / validate a save). */
export async function getDefaultValue(locale: string, key: string): Promise<string | null> {
  const flat = flattenLeaves(await loadDefaults(locale));
  return key in flat ? String(flat[key]) : null;
}
