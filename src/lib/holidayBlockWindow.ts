export const HOLIDAY_BLOCK_START_KEY = '__settings.holiday_block_start';
export const HOLIDAY_BLOCK_END_KEY = '__settings.holiday_block_end';
export const HOLIDAY_BLOCK_SETTING_KEYS = [HOLIDAY_BLOCK_START_KEY, HOLIDAY_BLOCK_END_KEY] as const;

// Hidden technical locale used only to persist owner settings in the existing
// content_overrides table without requiring a risky live schema migration.
// The public content editor only lists known message keys, so these rows stay
// invisible to the owner-facing text editor.
export const HOLIDAY_BLOCK_SETTINGS_LOCALE = 'nl';

export type HolidayBlockWindow = {
  start: string;
  end: string;
};

export const EMPTY_HOLIDAY_BLOCK_WINDOW: HolidayBlockWindow = {
  start: '',
  end: '',
};

export function normalizeIsoDate(value: unknown) {
  const date = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

export function normalizeHolidayBlockWindow(start: unknown, end: unknown): HolidayBlockWindow {
  const normalizedStart = normalizeIsoDate(start);
  const normalizedEnd = normalizeIsoDate(end);

  if (!normalizedStart && !normalizedEnd) return EMPTY_HOLIDAY_BLOCK_WINDOW;
  if (!normalizedStart || !normalizedEnd) return EMPTY_HOLIDAY_BLOCK_WINDOW;
  if (normalizedStart > normalizedEnd) return EMPTY_HOLIDAY_BLOCK_WINDOW;

  return {
    start: normalizedStart,
    end: normalizedEnd,
  };
}

export function holidayBlockWindowFromRows(rows: { key: string; value: string | null }[] | null | undefined) {
  if (!rows?.length) return EMPTY_HOLIDAY_BLOCK_WINDOW;

  const values = new Map(rows.map((row) => [row.key, row.value ?? '']));
  return normalizeHolidayBlockWindow(
    values.get(HOLIDAY_BLOCK_START_KEY),
    values.get(HOLIDAY_BLOCK_END_KEY),
  );
}

export function dateKeyInTimeZone(date: Date, timeZone = 'Europe/Brussels') {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: 'year' | 'month' | 'day') =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isHolidayBlockWindowActive(window: HolidayBlockWindow, now = new Date()) {
  if (!window.start || !window.end) return false;
  const today = dateKeyInTimeZone(now);
  return today >= window.start && today <= window.end;
}

export function isDateInHolidayBlockWindow(dateIso: string, window: HolidayBlockWindow) {
  const date = normalizeIsoDate(dateIso);
  if (!date || !window.start || !window.end) return false;
  return date >= window.start && date <= window.end;
}
