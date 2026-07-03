'use client';

import { useMemo, useState } from 'react';
import { HolidayAnnouncementCard, type HolidaySeason } from '@/components/ui/HolidayAnnouncementCard';
import type { HolidayBlockWindow } from '@/lib/holidayBlockWindow';
import { AdminSubmitButton } from '../AdminSubmitButton';

type Locale = 'nl' | 'fr' | 'en';
type LocalizedText = Record<Locale, string>;

const SEASON_OPTIONS: { value: HolidaySeason; label: string; hint: string }[] = [
  { value: 'summer', label: 'Zomer', hint: 'warme zon, vakantie, open terras' },
  { value: 'autumn', label: 'Herfst', hint: 'diep roodbruin, bladeren, gezelligheid' },
  { value: 'winter', label: 'Winter', hint: 'avondblauw, feestdagen, lantaarns' },
  { value: 'spring', label: 'Lente', hint: 'groen, bloesem, frisse start' },
];

const input =
  'rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900';

export function BannerSettingsForm({
  active,
  initialTheme,
  initialBlockWindow,
  initialTitle,
  initialMessage,
  action,
}: {
  active: boolean;
  initialTheme: HolidaySeason;
  initialBlockWindow: HolidayBlockWindow;
  initialTitle: LocalizedText;
  initialMessage: LocalizedText;
  action: (formData: FormData) => Promise<void>;
}) {
  const [theme, setTheme] = useState<HolidaySeason>(initialTheme);
  const [blockWindow, setBlockWindow] = useState<HolidayBlockWindow>(initialBlockWindow);
  const [title, setTitle] = useState<LocalizedText>(initialTitle);
  const [message, setMessage] = useState<LocalizedText>(initialMessage);

  const visibleTitle = title.nl.trim() || title.fr.trim() || title.en.trim();
  const visibleMessage = message.nl.trim() || message.fr.trim() || message.en.trim();
  const allTextsFilled = Boolean(
    title.nl.trim() &&
      title.fr.trim() &&
      title.en.trim() &&
      message.nl.trim() &&
      message.fr.trim() &&
      message.en.trim(),
  );
  const isVisibleOnWebsite = active && allTextsFilled;
  const blockDatesEmpty = !blockWindow.start && !blockWindow.end;
  const blockDatesComplete = Boolean(
    blockWindow.start && blockWindow.end && blockWindow.start <= blockWindow.end,
  );
  const blockDatesValid = blockDatesEmpty || blockDatesComplete;

  const previewTitle = visibleTitle || 'Nog geen tekst ingevuld';
  const previewMessage =
    visibleMessage ||
    'Vul hieronder een titel of bericht in. Pas daarna kan deze kaart zichtbaar worden op de website.';

  const selectedHint = useMemo(
    () => SEASON_OPTIONS.find((option) => option.value === theme)?.hint,
    [theme],
  );

  const updateText =
    (kind: 'title' | 'message', locale: Locale) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const setter = kind === 'title' ? setTitle : setMessage;
      setter((current) => ({ ...current, [locale]: event.target.value }));
    };

  return (
    <>
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Voorbeeld op de website
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                isVisibleOnWebsite ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isVisibleOnWebsite
                ? blockDatesComplete
                  ? 'Deze aankondiging is zichtbaar. Reserveren, bellen en de API blokkeren alleen binnen de gekozen datums.'
                  : 'Deze aankondiging is zichtbaar, maar blokkeert niets zolang er geen geldige datums zijn.'
                : active
                  ? 'Nog niet zichtbaar: vul alle titels en berichten in Nederlands, Frans en Engels in.'
                  : 'Nog niet zichtbaar: vul alle talen in en kies daarna “Bewaren en tonen”.'}
            </p>
          </div>
          <p className="text-xs text-zinc-500">Live preview · {selectedHint}</p>
        </div>
        <HolidayAnnouncementCard
          theme={theme}
          title={previewTitle}
          message={previewMessage}
          inactive={!isVisibleOnWebsite}
        />
      </div>

      <form action={action} className="mt-5 border-t border-zinc-200 pt-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <label className="block text-sm font-medium text-zinc-700">
            Thema van de kaart
            <select
              name="theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value as HolidaySeason)}
              className={`${input} mt-1 w-full`}
            >
              {SEASON_OPTIONS.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
          </label>

          <div
            className={`rounded-2xl border p-4 ${
              blockDatesValid ? 'border-zinc-200 bg-zinc-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1 text-sm font-medium text-zinc-700">
                Blokkeren van
                <input
                  name="block_start"
                  type="date"
                  value={blockWindow.start}
                  onChange={(event) =>
                    setBlockWindow((current) => ({ ...current, start: event.target.value }))
                  }
                  className={`${input} mt-1 w-full`}
                />
              </label>
              <label className="block flex-1 text-sm font-medium text-zinc-700">
                Tot en met
                <input
                  name="block_end"
                  type="date"
                  min={blockWindow.start || undefined}
                  value={blockWindow.end}
                  onChange={(event) =>
                    setBlockWindow((current) => ({ ...current, end: event.target.value }))
                  }
                  className={`${input} mt-1 w-full`}
                />
              </label>
              {(blockWindow.start || blockWindow.end) && (
                <button
                  type="button"
                  onClick={() => setBlockWindow({ start: '', end: '' })}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Datums wissen
                </button>
              )}
            </div>
            <p className={`mt-2 text-xs font-medium ${blockDatesValid ? 'text-zinc-500' : 'text-red-700'}`}>
              {blockDatesValid
                ? blockDatesComplete
                  ? 'Tijdens deze periode worden reserveren, bellen en de reservation API geblokkeerd.'
                  : 'Leeg laten = alleen een aankondiging tonen, zonder blokkering.'
                : 'Kies een begin- én einddatum. De einddatum mag niet vóór de begindatum liggen.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(['nl', 'fr', 'en'] as const).map((locale) => (
            <div key={locale} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {locale === 'nl' ? 'Nederlands' : locale === 'fr' ? 'Frans' : 'Engels'}
              </p>
              <input
                name={`title_${locale}`}
                value={title[locale]}
                onChange={updateText('title', locale)}
                placeholder="Titel (bv. Zomervakantie)"
                className={`${input} w-full`}
              />
              <textarea
                name={`message_${locale}`}
                rows={3}
                value={message[locale]}
                onChange={updateText('message', locale)}
                placeholder="Bericht (bv. Gesloten van 15 t.e.m. 30 juli)"
                className={`${input} w-full`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <AdminSubmitButton
            name="publish"
            value="false"
            disabled={!blockDatesValid}
            pendingText="Opslaan…"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          >
            Bewaren zonder tonen
          </AdminSubmitButton>
          <AdminSubmitButton
            name="publish"
            value="true"
            disabled={!allTextsFilled || !blockDatesValid}
            pendingText="Publiceren…"
            className="rounded-lg bg-[#c1272d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a81f25] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
          >
            Bewaren en tonen op website
          </AdminSubmitButton>
          {!allTextsFilled && (
            <p className="basis-full text-xs font-medium text-amber-700">
              Vul eerst alle 6 velden in: titel + bericht voor Nederlands, Frans en Engels.
            </p>
          )}
          {!blockDatesValid && (
            <p className="basis-full text-xs font-medium text-red-700">
              Controleer de blokkadedatums voordat u opslaat.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
