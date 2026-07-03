/**
 * Tiny in-memory stale-while-revalidate cache for the PUBLIC page's Supabase
 * reads (banner status + content overrides). Without it every page view blocks
 * server rendering on live DB round trips (force-dynamic disables all Next
 * caching), which is the dominant TTFB cost of the site.
 *
 * Freshness contract: admin save actions call `invalidatePublicContentCache()`
 * in the same process, so owner edits are visible on the very next request.
 * The short TTL only bounds staleness across additional server instances.
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  refreshing: boolean;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 10_000;

export function invalidatePublicContentCache(): void {
  store.clear();
}

export async function withPublicCache<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry) {
    if (now < entry.expiresAt) return entry.value;
    // Stale: serve the previous value immediately and refresh in the background,
    // so no visitor ever waits on the database.
    if (!entry.refreshing) {
      entry.refreshing = true;
      void load()
        .then((value) => {
          store.set(key, { value, expiresAt: Date.now() + ttlMs, refreshing: false });
        })
        .catch(() => {
          entry.refreshing = false;
        });
    }
    return entry.value;
  }

  const value = await load();
  store.set(key, { value, expiresAt: now + ttlMs, refreshing: false });
  return value;
}
