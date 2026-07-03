'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

/**
 * Returns the active theme from the nearest data-theme context (defaults to the
 * <html> element). Re-renders when the user toggles. SSR-safe: starts on 'dark'
 * (the server default) then syncs on mount, so no hydration mismatch.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const el = document.documentElement;
    const read = () =>
      setTheme(el.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return theme;
}
