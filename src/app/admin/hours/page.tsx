import { requireAdmin } from '@/lib/admin/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import {
  OPENING_SCHEDULE_KEY,
  OPENING_SCHEDULE_LOCALE,
  parseScheduleConfig,
} from '@/lib/scheduleConfig';
import { AdminShell } from '../AdminShell';
import { ScheduleEditor } from './ScheduleEditor';
import { saveSchedule } from '../schedule-actions';

export const dynamic = 'force-dynamic';

export default async function HoursPage() {
  const user = await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from('content_overrides')
    .select('value')
    .eq('locale', OPENING_SCHEDULE_LOCALE)
    .eq('key', OPENING_SCHEDULE_KEY)
    .maybeSingle();

  const config = parseScheduleConfig((data as { value: string | null } | null)?.value);

  return (
    <AdminShell active="hours" email={user.email}>
      <h1 className="text-2xl font-semibold text-zinc-900">Openingsuren</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        Stel per weekdag in wanneer gasten online kunnen reserveren (lunch en/of diner). Voor
        uitzonderingen — een feestdag, verlof of een dag met andere uren — voeg je onderaan een
        losse datum toe. Die overschrijft de vaste uren voor die ene dag.
      </p>

      <ScheduleEditor initialConfig={config} action={saveSchedule} />
    </AdminShell>
  );
}
