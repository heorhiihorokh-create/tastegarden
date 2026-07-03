import { requireAdmin } from '@/lib/admin/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  applyBulk,
  closeBooking,
  confirmBooking,
  createBooking,
  deleteBooking,
  setBookingsClosed,
  updateClosedMessages,
} from './actions';
import { AdminShell } from './AdminShell';
import { AdminSubmitButton } from './AdminSubmitButton';
import { ConfirmButton, SelectAll } from './ConfirmButton';

export const dynamic = 'force-dynamic';

type Status = 'pending' | 'confirmed' | 'closed';
type Booking = {
  id: string;
  created_at: string;
  service: 'lunch' | 'dinner';
  date: string;
  slot: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  locale: string;
  status: Status;
};
type Settings = {
  bookings_closed: boolean;
  closed_message_nl: string;
  closed_message_fr: string;
  closed_message_en: string;
};

const nlDate = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
const nlDateTime = new Intl.DateTimeFormat('nl-BE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const dateTime = (iso: string, slot: string) => `${nlDate.format(new Date(`${iso}T00:00:00`))} ${slot}`;

const STATUS: Record<Status, { label: string; cls: string }> = {
  pending: { label: 'PENDING', cls: 'text-amber-600' },
  confirmed: { label: 'CONFIRMED', cls: 'text-emerald-600' },
  closed: { label: 'REJECTED', cls: 'text-zinc-500' },
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>;
}) {
  const user = await requireAdmin();
  const sp = await searchParams;

  const dateFilter = (['all', 'upcoming', 'today'] as const).includes(sp.date as 'all')
    ? (sp.date as 'all' | 'upcoming' | 'today')
    : 'upcoming';
  const statusFilter = (['all', 'pending', 'confirmed', 'closed'] as const).includes(sp.status as 'all')
    ? (sp.status as 'all' | Status)
    : 'all';
  const q = (sp.q ?? '').trim().replace(/[,%()]/g, '').slice(0, 80);

  const supabase = await getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('slot', { ascending: true });
  if (dateFilter === 'today') query = query.eq('date', today);
  else if (dateFilter === 'upcoming') query = query.gte('date', today);
  if (q) query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);

  const [settingsResult, bookingsResult] = await Promise.all([
    supabase
      .from('settings')
      .select('bookings_closed, closed_message_nl, closed_message_fr, closed_message_en')
      .eq('id', 1)
      .single(),
    query.limit(500),
  ]);

  const settings = settingsResult.data as Settings | null;
  const closed = Boolean(settings?.bookings_closed);
  const scopedRows = bookingsResult.data;
  const scoped = (scopedRows ?? []) as Booking[];

  const counts = {
    all: scoped.length,
    pending: scoped.filter((b) => b.status === 'pending').length,
    confirmed: scoped.filter((b) => b.status === 'confirmed').length,
    closed: scoped.filter((b) => b.status === 'closed').length,
  };
  const rows = statusFilter === 'all' ? scoped : scoped.filter((b) => b.status === statusFilter);

  const href = (over: Partial<{ date: string; status: string; q: string }>) => {
    const p = new URLSearchParams();
    p.set('date', over.date ?? dateFilter);
    const st = over.status ?? statusFilter;
    if (st !== 'all') p.set('status', st);
    const qq = over.q ?? q;
    if (qq) p.set('q', qq);
    return `/admin?${p.toString()}`;
  };

  const dateTab = (key: 'all' | 'upcoming' | 'today', label: string) =>
    dateFilter === key ? (
      <span className="font-semibold text-zinc-900">{label}</span>
    ) : (
      <Link href={href({ date: key })} prefetch className="text-[#2271b1] hover:underline">
        {label}
      </Link>
    );

  const statusTab = (key: 'all' | Status, label: string, n: number) => (
    <Link
      href={href({ status: key })}
      prefetch
      className={statusFilter === key ? 'font-semibold text-zinc-900' : 'text-[#2271b1] hover:underline'}
    >
      {label} <span className="text-zinc-400">({n})</span>
    </Link>
  );

  const input = 'rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-900';

  return (
    <AdminShell active="bookings" email={user.email}>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Reservaties</h1>

      {/* Booking-stop toggle (owner feature) */}
      <section className={`mb-8 rounded-2xl border p-5 sm:p-6 ${closed ? 'border-[#c1272d]/40 bg-[#c1272d]/5' : 'border-zinc-200 bg-white'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${closed ? 'bg-[#c1272d]' : 'bg-emerald-500'}`} />
              <h2 className="text-lg font-semibold text-zinc-900">
                {closed ? 'Reservaties zijn GESLOTEN' : 'Reservaties staan open'}
              </h2>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Uitleg: zet dit op “gesloten” wanneer alles volzet is. Het reservatieformulier op de
              website wordt dan geblokkeerd en bezoekers zien een duidelijke melding. Terug op “open” →
              alles werkt weer.
            </p>
          </div>
          <form action={setBookingsClosed}>
            <input type="hidden" name="closed" value={closed ? 'false' : 'true'} />
            <AdminSubmitButton
              pendingText={closed ? 'Heropenen…' : 'Sluiten…'}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-75 ${closed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#c1272d] hover:bg-[#a81f25]'}`}
            >
              {closed ? 'Reservaties heropenen' : 'Reservaties sluiten'}
            </AdminSubmitButton>
          </form>
        </div>
        <form action={updateClosedMessages} className="mt-5 border-t border-zinc-200 pt-5">
          <p className="mb-2 text-sm font-medium text-zinc-700">Melding voor bezoekers (wanneer gesloten)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">Nederlands
              <textarea name="nl" rows={2} defaultValue={settings?.closed_message_nl ?? ''} className={`${input} w-full`} /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">Frans
              <textarea name="fr" rows={2} defaultValue={settings?.closed_message_fr ?? ''} className={`${input} w-full`} /></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">Engels
              <textarea name="en" rows={2} defaultValue={settings?.closed_message_en ?? ''} className={`${input} w-full`} /></label>
          </div>
          <AdminSubmitButton
            pendingText="Opslaan…"
            className="mt-3 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-70"
          >
            Melding opslaan
          </AdminSubmitButton>
        </form>
      </section>

      {/* ===== Bookings (WordPress gst-booking layout) ===== */}
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-zinc-900">Bookings</h2>
        <details className="group relative">
          <summary className="cursor-pointer list-none rounded border border-[#2271b1] px-3 py-1 text-sm font-medium text-[#2271b1] hover:bg-[#2271b1]/5">
            Add New
          </summary>
          <form action={createBooking} className="absolute left-0 z-10 mt-2 w-[22rem] max-w-[90vw] rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
            <p className="mb-3 text-sm font-semibold text-zinc-800">Reservatie handmatig toevoegen</p>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="col-span-1 flex flex-col gap-1 text-xs text-zinc-500">Datum<input type="date" name="date" required className={input} /></label>
              <label className="col-span-1 flex flex-col gap-1 text-xs text-zinc-500">Uur<input type="text" name="time" placeholder="18:30" required className={input} /></label>
              <label className="col-span-1 flex flex-col gap-1 text-xs text-zinc-500">Dienst
                <select name="service" className={input}><option value="dinner">Diner</option><option value="lunch">Lunch</option></select></label>
              <label className="col-span-1 flex flex-col gap-1 text-xs text-zinc-500">Personen<input type="number" name="guests" min={1} max={40} defaultValue={2} className={input} /></label>
              <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500">Naam<input type="text" name="name" className={input} /></label>
              <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500">Telefoon<input type="text" name="phone" className={input} /></label>
              <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500">E-mail<input type="email" name="email" className={input} /></label>
            </div>
            <AdminSubmitButton
              pendingText="Toevoegen…"
              className="mt-3 w-full rounded-lg bg-[#c1272d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a81f25] disabled:cursor-wait disabled:opacity-75"
            >
              Toevoegen
            </AdminSubmitButton>
          </form>
        </details>
      </div>

      {/* DATE row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold uppercase tracking-wide text-[#c1272d]">Date:</span>
        {dateTab('all', 'All')}<span className="text-zinc-300">|</span>
        {dateTab('upcoming', 'Upcoming')}<span className="text-zinc-300">|</span>
        {dateTab('today', 'Today')}
      </div>

      {/* Status tabs + search */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {statusTab('all', 'All', counts.all)}<span className="text-zinc-300">|</span>
          {statusTab('pending', 'Pending', counts.pending)}<span className="text-zinc-300">|</span>
          {statusTab('confirmed', 'Confirmed', counts.confirmed)}<span className="text-zinc-300">|</span>
          {statusTab('closed', 'Rejected', counts.closed)}
        </div>
        <form method="get" action="/admin" className="flex items-center gap-2">
          <input type="hidden" name="date" value={dateFilter} />
          {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
          <input type="search" name="q" defaultValue={q} placeholder="E-mail of naam" className={`${input} w-52`} />
          <button className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
            Search
          </button>
        </form>
      </div>

      {/* Bulk actions + list (single form) */}
      <form action={applyBulk}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select name="bulk_action" className={input} defaultValue="">
              <option value="">Bulk actions</option>
              <option value="confirm">Confirm</option>
              <option value="close">Reject</option>
              <option value="delete">Delete</option>
            </select>
            <AdminSubmitButton className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-70">
              Apply
            </AdminSubmitButton>
          </div>
          <span className="text-sm text-zinc-500">{rows.length} items</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-10 px-3 py-3"><SelectAll className="h-4 w-4" /></th>
                <th className="px-3 py-3">Date, Time</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Party</th>
                <th className="px-3 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-14 text-center text-zinc-500">Geen reservaties in deze weergave.</td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id} className={`align-top ${b.message ? 'bg-amber-50/60' : ''}`}>
                    <td className="px-3 py-3"><input type="checkbox" name="ids" value={b.id} className="h-4 w-4" /></td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-zinc-900">
                      {dateTime(b.date, b.slot)}
                      <div className="text-xs font-normal text-zinc-400">{b.service === 'lunch' ? 'Lunch' : 'Diner'}</div>
                    </td>
                    <td className="px-3 py-3 text-zinc-800">{b.name}</td>
                    <td className="px-3 py-3">
                      <a href={`mailto:${b.email}`} className="break-all text-[#2271b1] hover:underline">{b.email}</a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <a href={`tel:${b.phone}`} className="text-[#2271b1] hover:underline">{b.phone}</a>
                    </td>
                    <td className={`whitespace-nowrap px-3 py-3 text-xs font-bold ${STATUS[b.status].cls}`}>
                      {STATUS[b.status].label}
                    </td>
                    <td className="px-3 py-3 text-right text-zinc-700">{b.guests}</td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-zinc-500">Request on {nlDateTime.format(new Date(b.created_at))}</div>
                      {b.message && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs font-semibold text-[#2271b1]">READ MESSAGE</summary>
                          <p className="mt-1 max-w-xs whitespace-pre-line text-xs italic text-zinc-600">{b.message}</p>
                        </details>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {b.status !== 'confirmed' && (
                          <button name="id" value={b.id} formAction={confirmBooking}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                            Confirm
                          </button>
                        )}
                        {b.status !== 'closed' && (
                          <button name="id" value={b.id} formAction={closeBooking}
                            className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100">
                            Reject
                          </button>
                        )}
                        <ConfirmButton name="id" value={b.id} formAction={deleteBooking}
                          message={`Reservatie van ${b.name} op ${dateTime(b.date, b.slot)} verwijderen?`}
                          className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                          Delete
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </form>
    </AdminShell>
  );
}
