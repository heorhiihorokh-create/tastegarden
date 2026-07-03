import { requireAdmin } from '@/lib/admin/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { HolidaySeason } from '@/components/ui/HolidayAnnouncementCard';
import {
  HOLIDAY_BLOCK_SETTING_KEYS,
  HOLIDAY_BLOCK_SETTINGS_LOCALE,
  holidayBlockWindowFromRows,
} from '@/lib/holidayBlockWindow';
import { AdminShell } from '../AdminShell';
import { AdminSubmitButton } from '../AdminSubmitButton';
import { setHolidayActive, updateHoliday } from '../actions';
import { BannerSettingsForm } from './BannerSettingsForm';

export const dynamic = 'force-dynamic';

type Settings = {
  holiday_active: boolean;
  holiday_theme: string;
  holiday_title_nl: string;
  holiday_title_fr: string;
  holiday_title_en: string;
  holiday_message_nl: string;
  holiday_message_fr: string;
  holiday_message_en: string;
};

const SEASONS = ['summer', 'autumn', 'winter', 'spring'] as const;

export default async function BannerPage() {
  const user = await requireAdmin();
  const supabase = await getSupabaseServer();

  const [settingsResult, blockWindowResult] = await Promise.all([
    supabase
      .from('settings')
      .select(
        'holiday_active, holiday_theme, holiday_title_nl, holiday_title_fr, holiday_title_en, holiday_message_nl, holiday_message_fr, holiday_message_en',
      )
      .eq('id', 1)
      .single(),
    supabase
      .from('content_overrides')
      .select('key, value')
      .eq('locale', HOLIDAY_BLOCK_SETTINGS_LOCALE)
      .in('key', [...HOLIDAY_BLOCK_SETTING_KEYS]),
  ]);

  const settings = settingsResult.data as Settings | null;
  const blockWindow = holidayBlockWindowFromRows(blockWindowResult.data);

  const holidayActive = Boolean(settings?.holiday_active);
  const allHolidayTextFilled = Boolean(
    settings?.holiday_title_nl?.trim() &&
      settings?.holiday_title_fr?.trim() &&
      settings?.holiday_title_en?.trim() &&
      settings?.holiday_message_nl?.trim() &&
      settings?.holiday_message_fr?.trim() &&
      settings?.holiday_message_en?.trim(),
  );
  const blockWindowFilled = Boolean(blockWindow.start && blockWindow.end);
  const visibleOnWebsite = holidayActive && allHolidayTextFilled;
  const theme = SEASONS.includes(settings?.holiday_theme as HolidaySeason)
    ? (settings?.holiday_theme as HolidaySeason)
    : 'summer';

  return (
    <AdminShell active="banner" email={user.email}>
      <h1 className="text-2xl font-semibold text-zinc-900">Aankondiging (vakantie / seizoen)</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        Toon een seizoenskaart bovenaan het reservatiegedeelte van de website. De kaart kan zichtbaar
        zijn zonder meteen alles te blokkeren: reserveren en bellen worden alleen geblokkeerd binnen
        de gekozen datums hieronder.
      </p>

      <section
        className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
          visibleOnWebsite
            ? blockWindowFilled
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-amber-300 bg-amber-50'
            : holidayActive
              ? 'border-amber-400/60 bg-amber-50'
              : 'border-zinc-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                visibleOnWebsite
                  ? blockWindowFilled
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                  : holidayActive
                    ? 'bg-amber-500'
                    : 'bg-zinc-300'
              }`}
            />
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {visibleOnWebsite
                  ? blockWindowFilled
                    ? 'Aankondiging zichtbaar · blokkering gepland'
                    : 'Aankondiging zichtbaar · geen blokkadedatums'
                  : holidayActive
                    ? 'Aankondiging staat AAN, maar mist nog vertalingen'
                    : 'Aankondiging staat UIT'}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {blockWindowFilled
                  ? `Blokkeert reservaties van ${blockWindow.start} t.e.m. ${blockWindow.end}.`
                  : 'Zonder datums blijft reserveren mogelijk, ook als de aankondiging zichtbaar is.'}
              </p>
            </div>
          </div>
          <form action={setHolidayActive}>
            <input type="hidden" name="active" value={holidayActive ? 'false' : 'true'} />
            <AdminSubmitButton
              disabled={!holidayActive && !allHolidayTextFilled}
              pendingText={holidayActive ? 'Verbergen…' : 'Tonen…'}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 ${
                holidayActive ? 'bg-zinc-700 hover:bg-zinc-800' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {holidayActive
                ? 'Aankondiging verbergen'
                : allHolidayTextFilled
                  ? 'Aankondiging tonen'
                  : 'Vul alle teksten in'}
            </AdminSubmitButton>
          </form>
        </div>

        <BannerSettingsForm
          active={holidayActive}
          initialTheme={theme}
          initialBlockWindow={blockWindow}
          initialTitle={{
            nl: settings?.holiday_title_nl ?? '',
            fr: settings?.holiday_title_fr ?? '',
            en: settings?.holiday_title_en ?? '',
          }}
          initialMessage={{
            nl: settings?.holiday_message_nl ?? '',
            fr: settings?.holiday_message_fr ?? '',
            en: settings?.holiday_message_en ?? '',
          }}
          action={updateHoliday}
        />
      </section>
    </AdminShell>
  );
}
