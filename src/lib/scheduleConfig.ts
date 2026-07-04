/**
 * Owner-editable opening schedule (client-safe, pure).
 *
 * The restaurant's bookable hours used to be hardcoded in `openingSchedule.ts`.
 * They now live here as a config the owner edits in /admin, stored as a single
 * JSON string in the existing `content_overrides` table (same trick as the
 * holiday block window — no risky schema migration). Server access lives in
 * `scheduleConfig.server.ts`; this file stays free of server imports so the
 * public reservation form can use the same types and resolution on the client.
 */

export const OPENING_SCHEDULE_KEY = '__settings.opening_schedule';
export const OPENING_SCHEDULE_LOCALE = 'nl';

/** A single service (lunch OR dinner) on one day: whether it is open and its window. */
export type ServiceHours = {
  open: boolean;
  from: string; // "HH:MM"
  to: string; // "HH:MM"
  /**
   * Online-bookable. When `open` but not `reservable`, the hours are shown on
   * the site with a lock (walk-in / phone only) and the reservation form does
   * NOT offer them.
   */
  reservable: boolean;
};

export type DaySchedule = {
  lunch: ServiceHours;
  dinner: ServiceHours;
};

/** Override for one specific calendar date (ISO yyyy-mm-dd). */
export type DateException = {
  /** Fully closed that day (overrides lunch/dinner). */
  closed: boolean;
  lunch: ServiceHours;
  dinner: ServiceHours;
};

export type LocalizedText = { nl: string; fr: string; en: string };

/**
 * Editable messages shown on the site when a service is open but not online
 * bookable (walk-in / phone only) — one for lunch, one for dinner.
 */
export type ScheduleMessages = {
  walkinLunch: LocalizedText;
  walkinDinner: LocalizedText;
};

export type ScheduleConfig = {
  /** Index 0..6 = Sunday..Saturday (matches Date.getUTCDay). */
  weekly: DaySchedule[];
  /** iso date -> exception. */
  exceptions: Record<string, DateException>;
  messages: ScheduleMessages;
};

export const DEFAULT_MESSAGES: ScheduleMessages = {
  walkinLunch: {
    nl: "'s Middags kan je niet online reserveren — bel ons of kom gerust langs.",
    fr: 'Le midi, la réservation en ligne n’est pas possible — appelez-nous ou passez simplement.',
    en: 'Lunch can’t be booked online — please call us or just walk in.',
  },
  walkinDinner: {
    nl: "'s Avonds kan je niet online reserveren — bel ons of kom gerust langs.",
    fr: 'Le soir, la réservation en ligne n’est pas possible — appelez-nous ou passez simplement.',
    en: 'Dinner can’t be booked online — please call us or just walk in.',
  },
};

export function pickText(text: LocalizedText, locale: string): string {
  if (locale.startsWith('fr')) return text.fr;
  if (locale.startsWith('en')) return text.en;
  return text.nl;
}

const off: ServiceHours = { open: false, from: '', to: '', reservable: false };
const hrs = (from: string, to: string, reservable = true): ServiceHours => ({
  open: true,
  from,
  to,
  reservable,
});

/**
 * Default = the schedule that used to be hardcoded, so nothing changes on day
 * one. Mon closed; Tue–Thu lunch is walk-in only (shown with a lock, not online
 * bookable) + bookable dinner; Fri–Sat lunch + late dinner; Sun long lunch +
 * dinner.
 */
export const DEFAULT_SCHEDULE: ScheduleConfig = {
  weekly: [
    { lunch: hrs('11:30', '16:00'), dinner: hrs('18:00', '22:00') }, // 0 Sun
    { lunch: { ...off }, dinner: { ...off } }, // 1 Mon
    { lunch: hrs('11:30', '14:30', false), dinner: hrs('18:00', '22:00') }, // 2 Tue
    { lunch: hrs('11:30', '14:30', false), dinner: hrs('18:00', '22:00') }, // 3 Wed
    { lunch: hrs('11:30', '14:30', false), dinner: hrs('18:00', '22:00') }, // 4 Thu
    { lunch: hrs('11:30', '14:30'), dinner: hrs('18:00', '23:00') }, // 5 Fri
    { lunch: hrs('11:30', '14:30'), dinner: hrs('18:00', '23:00') }, // 6 Sat
  ],
  exceptions: {},
  messages: DEFAULT_MESSAGES,
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function timeToMinutes(value: string): number | null {
  const m = TIME_RE.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Sanitize one service block from arbitrary input; invalid/empty -> closed. */
export function normalizeServiceHours(value: unknown): ServiceHours {
  if (!value || typeof value !== 'object') return { ...off };
  const v = value as Partial<ServiceHours>;
  const from = String(v.from ?? '').trim();
  const to = String(v.to ?? '').trim();
  const open =
    v.open === true &&
    timeToMinutes(from) !== null &&
    timeToMinutes(to) !== null &&
    (timeToMinutes(to) as number) > (timeToMinutes(from) as number);
  // reservable defaults to true (a plain open service is bookable online).
  return open ? { open: true, from, to, reservable: v.reservable !== false } : { ...off };
}

function normalizeDay(value: unknown): DaySchedule {
  const v = (value ?? {}) as Partial<DaySchedule>;
  return { lunch: normalizeServiceHours(v.lunch), dinner: normalizeServiceHours(v.dinner) };
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeException(value: unknown): DateException {
  const v = (value ?? {}) as Partial<DateException>;
  const lunch = normalizeServiceHours(v.lunch);
  const dinner = normalizeServiceHours(v.dinner);
  // Explicitly closed OR no service open at all → the day is closed. (Without
  // this, "uncheck both services" would look like a no-op and silently fall
  // back to the recurring weekly hours.)
  const closed = v.closed === true || (!lunch.open && !dinner.open);
  return {
    closed,
    lunch: closed ? { ...off } : lunch,
    dinner: closed ? { ...off } : dinner,
  };
}

/** Build a valid ScheduleConfig from unknown/partial input (falls back to defaults). */
export function normalizeScheduleConfig(value: unknown): ScheduleConfig {
  const v = (value ?? {}) as Partial<ScheduleConfig>;
  const weeklyInput = Array.isArray(v.weekly) ? v.weekly : [];
  const weekly = DEFAULT_SCHEDULE.weekly.map((fallback, i) =>
    weeklyInput[i] !== undefined ? normalizeDay(weeklyInput[i]) : { ...fallback },
  );

  const exceptions: Record<string, DateException> = {};
  if (v.exceptions && typeof v.exceptions === 'object') {
    for (const [iso, ex] of Object.entries(v.exceptions)) {
      if (!ISO_RE.test(iso)) continue;
      // Keep every valid-date exception; "no service open" is now a real closed
      // day (see normalizeException), not a no-op to drop.
      exceptions[iso] = normalizeException(ex);
    }
  }

  return { weekly, exceptions, messages: normalizeMessages(v.messages) };
}

function normalizeText(value: unknown, fallback: LocalizedText): LocalizedText {
  const v = (value ?? {}) as Partial<LocalizedText>;
  const pick = (x: unknown, f: string) =>
    typeof x === 'string' && x.trim() ? x.slice(0, 400) : f;
  return {
    nl: pick(v.nl, fallback.nl),
    fr: pick(v.fr, fallback.fr),
    en: pick(v.en, fallback.en),
  };
}

function normalizeMessages(value: unknown): ScheduleMessages {
  const v = (value ?? {}) as Partial<ScheduleMessages>;
  return {
    walkinLunch: normalizeText(v.walkinLunch, DEFAULT_MESSAGES.walkinLunch),
    walkinDinner: normalizeText(v.walkinDinner, DEFAULT_MESSAGES.walkinDinner),
  };
}

export function parseScheduleConfig(json: string | null | undefined): ScheduleConfig {
  if (!json) return DEFAULT_SCHEDULE;
  try {
    return normalizeScheduleConfig(JSON.parse(json));
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export function serializeScheduleConfig(config: ScheduleConfig): string {
  return JSON.stringify(normalizeScheduleConfig(config));
}

// ---- Public "Openingsuren" display, derived 1:1 from the same config --------

export type OpeningHoursRow = {
  key: string;
  label: string;
  /** JS weekdays (0..6) this row covers — used to highlight "today". */
  days: number[];
  lunch: string | null;
  dinner: string | null;
  /** false = the service is open but not online-bookable (shown with a lock). */
  lunchReservable: boolean;
  dinnerReservable: boolean;
  closed: boolean;
};

// Monday-first display order (Sunday last), matching how hours are usually read.
const WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function localeSeparator(locale: string): string {
  if (locale.startsWith('fr')) return 'h';
  if (locale.startsWith('en')) return ':';
  return 'u'; // nl (and default)
}

function formatTime(hhmm: string, locale: string): string {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}${localeSeparator(locale)}${m}`;
}

function formatWindow(hours: ServiceHours, locale: string): string | null {
  if (!hours.open || timeToMinutes(hours.from) === null || timeToMinutes(hours.to) === null) {
    return null;
  }
  return `${formatTime(hours.from, locale)}–${formatTime(hours.to, locale)}`;
}

function weekdayName(weekday: number, locale: string): string {
  // 2023-01-01 (UTC) is a Sunday, so +weekday lands on the matching day.
  const date = new Date(Date.UTC(2023, 0, 1 + weekday));
  const name = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Turn the weekly grid into display rows for the public "Openingsuren" list,
 * merging consecutive weekdays that share identical hours (e.g. "Dinsdag —
 * donderdag"). This is the SAME source the reservation form uses, so the
 * displayed hours can never drift from what is actually bookable.
 */
export function buildWeeklyHoursRows(config: ScheduleConfig, locale: string): OpeningHoursRow[] {
  const days = WEEK_DISPLAY_ORDER.map((weekday) => {
    const day = config.weekly[weekday] ?? { lunch: { ...off }, dinner: { ...off } };
    // Display shows every OPEN service (bookable or walk-in); the lock is driven
    // by `reservable`.
    const lunch = formatWindow(day.lunch, locale);
    const dinner = formatWindow(day.dinner, locale);
    const lunchReservable = !day.lunch.open || day.lunch.reservable;
    const dinnerReservable = !day.dinner.open || day.dinner.reservable;
    return {
      weekday,
      lunch,
      dinner,
      lunchReservable,
      dinnerReservable,
      closed: !lunch && !dinner,
      sig: `${lunch}:${lunchReservable}|${dinner}:${dinnerReservable}`,
    };
  });

  const rows: OpeningHoursRow[] = [];
  let i = 0;
  while (i < days.length) {
    let j = i;
    while (j + 1 < days.length && days[j + 1].sig === days[i].sig) j += 1;
    const first = days[i];
    const last = days[j];
    const label =
      i === j
        ? weekdayName(first.weekday, locale)
        : `${weekdayName(first.weekday, locale)} — ${weekdayName(last.weekday, locale)}`;
    rows.push({
      key: `${first.weekday}-${last.weekday}`,
      label,
      days: days.slice(i, j + 1).map((d) => d.weekday),
      lunch: first.lunch,
      dinner: first.dinner,
      lunchReservable: first.lunchReservable,
      dinnerReservable: first.dinnerReservable,
      closed: first.closed,
    });
    i = j + 1;
  }
  return rows;
}
