'use client';

import { useMemo, useRef, useState } from 'react';
import { AdminSubmitButton } from '../AdminSubmitButton';
import {
  type DaySchedule,
  type ScheduleConfig,
  type ScheduleMessages,
  type ServiceHours,
} from '@/lib/scheduleConfig';

const DAYS: { idx: number; label: string }[] = [
  { idx: 1, label: 'Maandag' },
  { idx: 2, label: 'Dinsdag' },
  { idx: 3, label: 'Woensdag' },
  { idx: 4, label: 'Donderdag' },
  { idx: 5, label: 'Vrijdag' },
  { idx: 6, label: 'Zaterdag' },
  { idx: 0, label: 'Zondag' },
];

// Short weekday names by JS weekday (0 = Sunday). Admin UI is Dutch-only.
const DOW_SHORT = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

type ExRow = {
  id: string;
  date: string;
  closed: boolean;
  lunch: ServiceHours;
  dinner: ServiceHours;
};

const OFF: ServiceHours = { open: false, from: '', to: '', reservable: false };
const newId = () => Math.random().toString(36).slice(2);

// ---- Pure date helpers (UTC-based, so no timezone drift) --------------------
const pad = (n: number) => String(n).padStart(2, '0');
const isoFromDate = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
};
const addDaysIso = (iso: string, n: number) => {
  const d = parseIso(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoFromDate(d);
};
const weekdayOfIso = (iso: string) => parseIso(iso).getUTCDay();
const mondayOfIso = (iso: string) => {
  const wd = weekdayOfIso(iso);
  return addDaysIso(iso, wd === 0 ? -6 : 1 - wd);
};
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const monthDayFmt = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long' });
const fullDateFmt = new Intl.DateTimeFormat('nl-BE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const timeInput =
  'rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900';
const selectInput =
  'rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900';

type ServiceState = 'closed' | 'bookable' | 'walkin';

function stateOf(v: ServiceHours): ServiceState {
  if (!v.open) return 'closed';
  return v.reservable ? 'bookable' : 'walkin';
}

/**
 * One service (lunch or dinner) as a single 3-way choice — clearer than two
 * separate checkboxes:
 *   Gesloten            = closed
 *   Online reserveerbaar = open + bookable online
 *   Enkel telefonisch    = open but walk-in only (shown with a lock, no online)
 */
function ServiceRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ServiceHours;
  onChange: (patch: Partial<ServiceHours>) => void;
}) {
  const setState = (s: ServiceState) => {
    if (s === 'closed') {
      onChange({ open: false, reservable: false });
      return;
    }
    // Default sensible hours if none set yet, so "open" never saves as empty.
    const times = value.from && value.to ? {} : { from: '18:00', to: '22:00' };
    onChange({ open: true, reservable: s === 'bookable', ...times });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="w-16 shrink-0 text-sm font-medium text-zinc-700">{label}</span>
      <select
        value={stateOf(value)}
        onChange={(e) => setState(e.target.value as ServiceState)}
        className={selectInput}
        aria-label={label}
      >
        <option value="closed">Gesloten</option>
        <option value="bookable">Online reserveerbaar</option>
        <option value="walkin">Enkel telefonisch (slotje)</option>
      </select>
      {value.open && (
        <div className="flex items-center gap-1.5">
          <input
            type="time"
            value={value.from}
            onChange={(e) => onChange({ from: e.target.value })}
            className={timeInput}
            aria-label={`${label} van`}
          />
          <span className="text-zinc-400">–</span>
          <input
            type="time"
            value={value.to}
            onChange={(e) => onChange({ to: e.target.value })}
            className={timeInput}
            aria-label={`${label} tot`}
          />
        </div>
      )}
    </div>
  );
}

export function ScheduleEditor({
  initialConfig,
  action,
}: {
  initialConfig: ScheduleConfig;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [weekly, setWeekly] = useState<DaySchedule[]>(() =>
    initialConfig.weekly.map((d) => ({ lunch: { ...d.lunch }, dinner: { ...d.dinner } })),
  );
  const [exceptions, setExceptions] = useState<ExRow[]>(() =>
    Object.entries(initialConfig.exceptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ex]) => ({
        id: newId(),
        date,
        closed: ex.closed,
        lunch: { ...ex.lunch },
        dinner: { ...ex.dinner },
      })),
  );
  const [weekStart, setWeekStart] = useState(() => mondayOfIso(todayIso()));
  const [messages, setMessages] = useState<ScheduleMessages>(() => ({
    walkinLunch: { ...initialConfig.messages.walkinLunch },
    walkinDinner: { ...initialConfig.messages.walkinDinner },
  }));
  const swipeX = useRef<number | null>(null);

  const setMessage = (
    service: 'walkinLunch' | 'walkinDinner',
    locale: 'nl' | 'fr' | 'en',
    value: string,
  ) =>
    setMessages((prev) => ({ ...prev, [service]: { ...prev[service], [locale]: value } }));

  const setDayService = (
    dayIdx: number,
    service: 'lunch' | 'dinner',
    patch: Partial<ServiceHours>,
  ) =>
    setWeekly((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, [service]: { ...d[service], ...patch } } : d)),
    );

  const patchException = (id: string, patch: Partial<ExRow>) =>
    setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const patchExceptionService = (
    id: string,
    service: 'lunch' | 'dinner',
    patch: Partial<ServiceHours>,
  ) =>
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [service]: { ...e[service], ...patch } } : e)),
    );

  // Tap a calendar day → add an exception pre-filled with that weekday's standard
  // hours. Tap the same day again → remove the exception (toggle).
  const toggleExceptionForDate = (iso: string) => {
    if (exceptions.some((e) => e.date === iso)) {
      setExceptions((prev) => prev.filter((e) => e.date !== iso));
      return;
    }
    const day = weekly[weekdayOfIso(iso)];
    const stdClosed = !day.lunch.open && !day.dinner.open;
    setExceptions((prev) =>
      [
        ...prev,
        {
          id: newId(),
          date: iso,
          closed: stdClosed,
          lunch: { ...day.lunch },
          dinner: { ...day.dinner },
        },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    );
  };

  const config: ScheduleConfig = {
    weekly,
    exceptions: Object.fromEntries(
      exceptions
        .filter((e) => ISO_RE.test(e.date))
        .map((e) => [e.date, { closed: e.closed, lunch: e.lunch, dinner: e.dinner }]),
    ),
    messages,
  };

  const dayClosed = (d: DaySchedule) => !d.lunch.open && !d.dinner.open;
  const today = todayIso();

  // Effective open/closed + exception marker for a specific date in the swiper.
  const statusForDate = (iso: string) => {
    const ex = exceptions.find((e) => e.date === iso);
    if (ex) {
      const open = !ex.closed && (ex.lunch.open || ex.dinner.open);
      return { hasException: true, open };
    }
    const day = weekly[weekdayOfIso(iso)];
    return { hasException: false, open: day.lunch.open || day.dinner.open };
  };

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysIso(weekStart, i)),
    [weekStart],
  );
  const weekEnd = parseIso(addDaysIso(weekStart, 6));
  const weekLabel = `${monthDayFmt.format(parseIso(weekStart))} – ${monthDayFmt.format(
    weekEnd,
  )} ${weekEnd.getUTCFullYear()}`;

  const onTouchEnd = (endX: number) => {
    if (swipeX.current === null) return;
    const delta = endX - swipeX.current;
    swipeX.current = null;
    if (delta > 45) setWeekStart((w) => addDaysIso(w, -7));
    else if (delta < -45) setWeekStart((w) => addDaysIso(w, 7));
  };

  const sortedExceptions = useMemo(
    () => [...exceptions].sort((a, b) => a.date.localeCompare(b.date)),
    [exceptions],
  );

  return (
    <form action={action} className="mt-6 space-y-8">
      <input type="hidden" name="config" value={JSON.stringify(config)} />

      {/* Weekly grid */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Vaste openingsuren (per weekdag)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Kies per dienst: <strong>Gesloten</strong>, <strong>Online reserveerbaar</strong>, of
          <strong> Enkel telefonisch</strong> (uren worden getoond met een slotje, maar niet online
          te reserveren — enkel bellen/walk-in). Beide diensten gesloten = die dag dicht.
        </p>

        <div className="mt-4 divide-y divide-zinc-100">
          {DAYS.map(({ idx, label }) => {
            const day = weekly[idx];
            return (
              <div
                key={idx}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="flex w-32 shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">{label}</span>
                  {dayClosed(day) && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                      Gesloten
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <ServiceRow
                    label="Lunch"
                    value={day.lunch}
                    onChange={(patch) => setDayService(idx, 'lunch', patch)}
                  />
                  <ServiceRow
                    label="Diner"
                    value={day.dinner}
                    onChange={(patch) => setDayService(idx, 'dinner', patch)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calendar swiper — overview of real dates + quick exception entry */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Kalender</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Blader door de weken en tik een dag om af te wijken (sluiten of andere uren); tik
              nogmaals om de uitzondering te verwijderen. Een stip toont of die dag open is; een
              oranje rand betekent een uitzondering.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDaysIso(w, -7))}
              aria-label="Vorige week"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(mondayOfIso(todayIso()))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Vandaag
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDaysIso(w, 7))}
              aria-label="Volgende week"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              ›
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-sm font-medium text-zinc-700">{weekLabel}</p>

        <div
          className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2"
          onTouchStart={(e) => (swipeX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
        >
          {weekDates.map((iso) => {
            const { open, hasException } = statusForDate(iso);
            const isToday = iso === today;
            const isPast = iso < today;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleExceptionForDate(iso)}
                disabled={isPast}
                aria-label={`${fullDateFmt.format(parseIso(iso))} — ${open ? 'open' : 'gesloten'}${
                  hasException ? ', uitzondering' : ''
                }`}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 transition-colors ${
                  isPast
                    ? 'cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-55'
                    : 'hover:border-zinc-400 hover:bg-zinc-50'
                } ${hasException ? 'border-amber-400 bg-amber-50' : 'border-zinc-200'} ${
                  isToday ? 'ring-2 ring-[#2271b1]/40' : ''
                }`}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
                  {DOW_SHORT[weekdayOfIso(iso)]}
                </span>
                <span className="text-base font-semibold text-zinc-900">
                  {parseIso(iso).getUTCDate()}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Exceptions */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Uitzonderingen (losse datums)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Overschrijft de vaste uren voor één datum. Voeg toe via de kalender hierboven; hier pas je
          de uren aan of sluit je de dag.
        </p>

        {sortedExceptions.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-zinc-200 py-6 text-center text-sm text-zinc-400">
            Nog geen uitzonderingen — tik een dag in de kalender hierboven.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedExceptions.map((ex) => (
              <div key={ex.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-900">
                    {ISO_RE.test(ex.date) ? capitalize(fullDateFmt.format(parseIso(ex.date))) : ex.date}
                  </span>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={ex.closed}
                      onChange={(e) => patchException(ex.id, { closed: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Hele dag gesloten
                  </label>
                  <button
                    type="button"
                    onClick={() => setExceptions((prev) => prev.filter((e) => e.id !== ex.id))}
                    className="ml-auto rounded px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Verwijderen
                  </button>
                </div>

                {!ex.closed && (
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-zinc-200 pt-3">
                    <ServiceRow
                      label="Lunch"
                      value={ex.lunch}
                      onChange={(patch) => patchExceptionService(ex.id, 'lunch', patch)}
                    />
                    <ServiceRow
                      label="Diner"
                      value={ex.dinner}
                      onChange={(patch) => patchExceptionService(ex.id, 'dinner', patch)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Walk-in messages shown when a service is open but not online bookable */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Melding bij “niet online reserveerbaar”</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Deze tekst verschijnt op de website wanneer een gast lunch of diner kiest die enkel
          telefonisch/walk-in is (het slotje). Eén tekst voor de middag, één voor de avond, in 3 talen.
        </p>

        {(
          [
            { key: 'walkinLunch', label: 'Middag (lunch)' },
            { key: 'walkinDinner', label: 'Avond (diner)' },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className="mt-4 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0">
            <p className="mb-2 text-sm font-semibold text-zinc-800">{label}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['nl', 'fr', 'en'] as const).map((loc) => (
                <label key={loc} className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
                  {loc === 'nl' ? 'Nederlands' : loc === 'fr' ? 'Frans' : 'Engels'}
                  <textarea
                    rows={3}
                    value={messages[key][loc]}
                    onChange={(e) => setMessage(key, loc, e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3">
        <AdminSubmitButton
          pendingText="Opslaan…"
          className="rounded-xl bg-[#c1272d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#a81f25] disabled:cursor-wait disabled:opacity-75"
        >
          Openingsuren opslaan
        </AdminSubmitButton>
        <span className="text-sm text-zinc-500">
          Geldt meteen voor het reservatieformulier op de website.
        </span>
      </div>
    </form>
  );
}
