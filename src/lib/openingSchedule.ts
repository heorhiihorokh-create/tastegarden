import {
  DEFAULT_SCHEDULE,
  timeToMinutes,
  type ScheduleConfig,
  type ServiceHours,
} from '@/lib/scheduleConfig';

export type Service = 'lunch' | 'dinner';

export type ServiceWindow = [number, number];

export type ReservationDayState = {
  iso: string;
  weekday: number;
  isHoliday: boolean;
  isCompensationTuesdayClosed: boolean;
  isClosed: boolean;
  closedReason: 'monday' | 'after_monday_holiday' | 'closed' | null;
  windows: Partial<Record<Service, ServiceWindow>>;
  /** Online-bookable per service. */
  available: Record<Service, boolean>;
  /** Physically open but NOT online-bookable (walk-in / phone only) per service. */
  walkIn: Record<Service, boolean>;
};

export const RESERVATION_STEP_MINUTES = 30;

const holidayCache = new Map<number, Set<string>>();

function parseIsoDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, date };
}

function isoFromUtcDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function addDaysIso(iso: string, days: number) {
  const parsed = parseIsoDate(iso);
  if (!parsed) return '';

  const date = new Date(parsed.date);
  date.setUTCDate(date.getUTCDate() + days);
  return isoFromUtcDate(date);
}

export function getWeekday(iso: string) {
  return parseIsoDate(iso)?.date.getUTCDay() ?? -1;
}

function easterSundayIso(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return isoFromUtcDate(new Date(Date.UTC(year, month - 1, day)));
}

function belgianPublicHolidays(year: number) {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const easter = easterSundayIso(year);
  const holidays = new Set([
    `${year}-01-01`,
    addDaysIso(easter, 1), // Easter Monday
    `${year}-05-01`,
    addDaysIso(easter, 39), // Ascension Day
    addDaysIso(easter, 50), // Whit Monday
    `${year}-07-21`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`,
  ]);

  holidayCache.set(year, holidays);
  return holidays;
}

export function isBelgianPublicHoliday(iso: string) {
  const parsed = parseIsoDate(iso);
  if (!parsed) return false;

  return belgianPublicHolidays(parsed.year).has(iso);
}

export function isCompensationTuesdayClosed(iso: string) {
  return getWeekday(iso) === 2 && isBelgianPublicHoliday(addDaysIso(iso, -1));
}

function hoursToWindow(hours: ServiceHours, bookableOnly: boolean): ServiceWindow | null {
  if (!hours.open) return null;
  if (bookableOnly && !hours.reservable) return null;
  const from = timeToMinutes(hours.from);
  const to = timeToMinutes(hours.to);
  if (from === null || to === null || to <= from) return null;
  return [from, to];
}

/**
 * The single source of truth for a date's windows: a specific-date exception
 * wins over the recurring weekly grid.
 *
 * `bookableOnly` (default true) returns only services that can be booked online
 * — used by the reservation form and API. Pass false for the display/"open now"
 * badge, which also counts walk-in (non-reservable) hours.
 */
export function resolveWindowsForDate(
  iso: string,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  bookableOnly = true,
): Partial<Record<Service, ServiceWindow>> {
  const weekday = getWeekday(iso);
  if (weekday < 0) return {};

  const exception = config.exceptions[iso];
  const day = exception
    ? exception.closed
      ? null
      : { lunch: exception.lunch, dinner: exception.dinner }
    : config.weekly[weekday];
  if (!day) return {};

  const windows: Partial<Record<Service, ServiceWindow>> = {};
  const lunch = hoursToWindow(day.lunch, bookableOnly);
  const dinner = hoursToWindow(day.dinner, bookableOnly);
  if (lunch) windows.lunch = lunch;
  if (dinner) windows.dinner = dinner;
  return windows;
}

export function getOpeningWindowsForDate(
  iso: string,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
): Partial<Record<Service, ServiceWindow>> {
  // Physical opening hours for the "open now" badge — include walk-in hours.
  return resolveWindowsForDate(iso, config, false);
}

export function getReservationDayState(
  iso: string,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
): ReservationDayState {
  const weekday = getWeekday(iso);
  const isHoliday = isBelgianPublicHoliday(iso);
  const isCompensation = isCompensationTuesdayClosed(iso);
  const bookable = resolveWindowsForDate(iso, config, true);
  const open = resolveWindowsForDate(iso, config, false);
  // "Closed" = physically closed (no service open at all); a walk-in-only day is
  // NOT closed — it shows the walk-in message instead of "gesloten".
  const isClosed = Object.keys(open).length === 0;

  return {
    iso,
    weekday,
    isHoliday,
    isCompensationTuesdayClosed: isCompensation,
    isClosed,
    closedReason: isClosed ? 'closed' : null,
    windows: bookable,
    available: {
      lunch: Boolean(bookable.lunch),
      dinner: Boolean(bookable.dinner),
    },
    walkIn: {
      lunch: Boolean(open.lunch) && !bookable.lunch,
      dinner: Boolean(open.dinner) && !bookable.dinner,
    },
  };
}

export function isServiceAvailableForDate(
  iso: string,
  service: Service,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
) {
  return Boolean(resolveWindowsForDate(iso, config)[service]);
}

export function formatSlot(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function buildReservationSlots(
  iso: string,
  service: Service,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  isToday = false,
  nowMinutes = 0,
) {
  const window = resolveWindowsForDate(iso, config)[service];
  if (!window) return [];

  const [start, end] = window;
  const slots: string[] = [];

  for (let time = start; time <= end - RESERVATION_STEP_MINUTES; time += RESERVATION_STEP_MINUTES) {
    if (isToday && time <= nowMinutes) continue;
    slots.push(formatSlot(time));
  }

  return slots;
}

export function getBelgiumNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '00';

  const iso = `${part('year')}-${part('month')}-${part('day')}`;
  const minutes = Number(part('hour')) * 60 + Number(part('minute'));

  return { iso, minutes };
}

export function getNextBookableDateIso(
  fromIso: string,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  service?: Service,
  nowMinutes = 0,
) {
  for (let offset = 0; offset <= 45; offset += 1) {
    const iso = addDaysIso(fromIso, offset);
    if (!iso) return '';

    const services: Service[] = service ? [service] : ['dinner', 'lunch'];
    const isToday = offset === 0;
    if (services.some((item) => buildReservationSlots(iso, item, config, isToday, nowMinutes).length > 0)) {
      return iso;
    }
  }

  return '';
}

export function normalizeService(value: unknown): Service | null {
  return value === 'lunch' || value === 'dinner' ? value : null;
}

export function isValidReservationSlot(
  iso: string,
  service: Service,
  time: string,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  now = new Date(),
) {
  const current = getBelgiumNow(now);
  return buildReservationSlots(iso, service, config, iso === current.iso, current.minutes).includes(time);
}
