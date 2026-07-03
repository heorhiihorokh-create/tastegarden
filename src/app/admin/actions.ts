'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { invalidatePublicContentCache } from '@/lib/publicCache';
import {
  HOLIDAY_BLOCK_END_KEY,
  HOLIDAY_BLOCK_SETTINGS_LOCALE,
  HOLIDAY_BLOCK_START_KEY,
  normalizeHolidayBlockWindow,
  normalizeIsoDate,
  type HolidayBlockWindow,
} from '@/lib/holidayBlockWindow';

export type LoginState = { error?: string };

type GuestBooking = {
  name: string;
  email: string;
  date: string;
  slot: string;
  guests: number;
  service: 'lunch' | 'dinner';
  locale: string;
};

// ------------------------------------------------------------ helpers
async function audit(action: string, detail: unknown) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert({ actor: user?.email ?? null, action, detail });
  } catch {
    /* logging must never block the action */
  }
}

function revalidatePublic() {
  // Public pages are force-dynamic/noStore and read through a tiny in-process
  // cache. Clearing that cache is the part that makes admin edits visible on
  // the next request; avoiding broad route revalidation keeps admin buttons
  // feeling instant instead of waiting on unrelated page trees.
  invalidatePublicContentCache();
}

async function saveHolidayBlockWindow(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  window: HolidayBlockWindow,
  updatedBy?: string | null,
) {
  const now = new Date().toISOString();
  const rows = [
    { key: HOLIDAY_BLOCK_START_KEY, value: window.start },
    { key: HOLIDAY_BLOCK_END_KEY, value: window.end },
  ];

  const results = await Promise.all(
    rows.map(({ key, value }) =>
      value
        ? supabase.from('content_overrides').upsert({
            key,
            locale: HOLIDAY_BLOCK_SETTINGS_LOCALE,
            value,
            updated_at: now,
            updated_by: updatedBy ?? null,
          })
        : supabase
            .from('content_overrides')
            .delete()
            .eq('key', key)
            .eq('locale', HOLIDAY_BLOCK_SETTINGS_LOCALE),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

function readHolidayBlockWindow(formData: FormData): HolidayBlockWindow | null {
  const start = normalizeIsoDate(formData.get('block_start'));
  const end = normalizeIsoDate(formData.get('block_end'));

  if (!start && !end) return { start: '', end: '' };
  if (!start || !end || start > end) return null;

  return normalizeHolidayBlockWindow(start, end);
}

function longDate(iso: string, locale: string) {
  const tag = locale === 'fr' ? 'fr-BE' : locale === 'en' ? 'en-GB' : 'nl-BE';
  try {
    return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(`${iso}T00:00:00`),
    );
  } catch {
    return iso;
  }
}

/** Warm, clear guest feedback in the guest's own language. */
function buildGuestEmail(kind: 'confirmed' | 'cancelled', b: GuestBooking) {
  const when = longDate(b.date, b.locale);
  const kitchen =
    b.locale === 'fr'
      ? b.service === 'lunch' ? 'Midi' : 'Soir'
      : b.locale === 'en'
        ? b.service === 'lunch' ? 'Lunch' : 'Dinner'
        : b.service === 'lunch' ? 'Lunch' : 'Diner';

  if (kind === 'confirmed') {
    if (b.locale === 'fr') {
      return {
        subject: 'Votre réservation est confirmée — Taste Garden',
        text:
          `Bonjour ${b.name},\n\n` +
          `Bonne nouvelle — votre table est confirmée. Nous avons hâte de vous accueillir chez Taste Garden.\n\n` +
          `Date : ${when}\nHeure : ${b.slot}\nPersonnes : ${b.guests}\nService : ${kitchen}\n\n` +
          `Adresse : Kortrijksestraat 276, 8870 Izegem\n` +
          `Une question ou une modification ? Appelez-nous au 051 30 38 88.\n\n` +
          `À bientôt,\nL'équipe Taste Garden`,
      };
    }
    if (b.locale === 'en') {
      return {
        subject: 'Your reservation is confirmed — Taste Garden',
        text:
          `Dear ${b.name},\n\n` +
          `Good news — your table is confirmed. We look forward to welcoming you at Taste Garden.\n\n` +
          `Date: ${when}\nTime: ${b.slot}\nGuests: ${b.guests}\nService: ${kitchen}\n\n` +
          `Address: Kortrijksestraat 276, 8870 Izegem\n` +
          `Any questions or changes? Call us on 051 30 38 88.\n\n` +
          `See you soon,\nThe Taste Garden team`,
      };
    }
    return {
      subject: 'Uw reservatie is bevestigd — Taste Garden',
      text:
        `Beste ${b.name},\n\n` +
        `Goed nieuws — uw tafel is bevestigd. We kijken ernaar uit u te verwelkomen bij Taste Garden.\n\n` +
        `Datum: ${when}\nUur: ${b.slot}\nAantal personen: ${b.guests}\nKeuken: ${kitchen}\n\n` +
        `Adres: Kortrijksestraat 276, 8870 Izegem\n` +
        `Vragen of wilt u iets wijzigen? Bel ons gerust op 051 30 38 88.\n\n` +
        `Tot binnenkort,\nHet team van Taste Garden`,
    };
  }

  // cancelled
  if (b.locale === 'fr') {
    return {
      subject: 'Au sujet de votre réservation — Taste Garden',
      text:
        `Bonjour ${b.name},\n\n` +
        `Merci pour votre demande. Malheureusement, nous ne pouvons pas confirmer votre réservation du ${when} à ${b.slot} — il est possible que nous soyons complets ce jour-là.\n\n` +
        `Appelez-nous au 051 30 38 88 : nous vous aiderons volontiers à trouver un autre moment.\n\n` +
        `Cordialement,\nL'équipe Taste Garden`,
    };
  }
  if (b.locale === 'en') {
    return {
      subject: 'About your reservation — Taste Garden',
      text:
        `Dear ${b.name},\n\n` +
        `Thank you for your request. Unfortunately we can't confirm your reservation for ${when} at ${b.slot} — we may be fully booked that day.\n\n` +
        `Please call us on 051 30 38 88; we'll gladly help you find another moment.\n\n` +
        `Kind regards,\nThe Taste Garden team`,
    };
  }
  return {
    subject: 'Over uw reservatie-aanvraag — Taste Garden',
    text:
      `Beste ${b.name},\n\n` +
      `Bedankt voor uw aanvraag. Helaas kunnen we uw reservatie voor ${when} om ${b.slot} niet bevestigen — mogelijk zijn we die dag volzet.\n\n` +
      `Bel ons gerust op 051 30 38 88; we helpen u graag met een alternatief moment.\n\n` +
      `Met vriendelijke groet,\nHet team van Taste Garden`,
  };
}

/** Best-effort guest email — never blocks the status change. */
async function emailGuest(kind: 'confirmed' | 'cancelled', b: GuestBooking) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATION_FROM || 'Taste Garden <onboarding@resend.dev>';
  if (!apiKey || !b.email) return;
  const { subject, text } = buildGuestEmail(kind, b);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [b.email], subject, text }),
    });
  } catch (e) {
    console.error('[admin] guest email error', e);
  }
}

async function setStatusAndEmail(id: string, status: 'confirmed' | 'closed') {
  const supabase = await getSupabaseServer();
  const { data: booking } = await supabase
    .from('bookings')
    .select('name, email, date, slot, guests, service, locale')
    .eq('id', id)
    .single();
  await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (booking) {
    await emailGuest(status === 'confirmed' ? 'confirmed' : 'cancelled', booking as GuestBooking);
  }
}

// ------------------------------------------------------------ auth
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Vul uw e-mail en wachtwoord in.' };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Ongeldige inloggegevens.' };

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: 'Dit account heeft geen toegang tot het beheer.' };
  }
  void audit('login', { email });
  redirect('/admin');
}

export async function signOutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ------------------------------------------------------------ per-booking
export async function confirmBooking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await setStatusAndEmail(id, 'confirmed');
  void audit('booking_confirm', { id });
  revalidatePath('/admin');
}

export async function closeBooking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await setStatusAndEmail(id, 'closed');
  void audit('booking_close', { id });
  revalidatePath('/admin');
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = await getSupabaseServer();
  await supabase.from('bookings').delete().eq('id', id);
  void audit('booking_delete', { id });
  revalidatePath('/admin');
}

// ------------------------------------------------------------ bulk
export async function applyBulk(formData: FormData) {
  await requireAdmin();
  const action = String(formData.get('bulk_action') ?? '');
  const ids = formData.getAll('ids').map((v) => String(v)).filter(Boolean);
  if (!ids.length || !['confirm', 'close', 'delete'].includes(action)) return;

  const supabase = await getSupabaseServer();
  if (action === 'delete') {
    await supabase.from('bookings').delete().in('id', ids);
  } else {
    const status = action === 'confirm' ? 'confirmed' : 'closed';
    for (const id of ids) await setStatusAndEmail(id, status);
  }
  void audit('booking_bulk', { action, count: ids.length });
  revalidatePath('/admin');
}

// ------------------------------------------------------------ manual add
export async function createBooking(formData: FormData) {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? '').trim();
  const service = get('service') === 'lunch' ? 'lunch' : 'dinner';
  const guests = Math.min(40, Math.max(1, Math.trunc(Number(get('guests')) || 1)));
  const row = {
    service,
    date: get('date'),
    slot: get('time'),
    guests,
    name: get('name').slice(0, 120) || '—',
    email: get('email').slice(0, 160),
    phone: get('phone').slice(0, 40) || '—',
    message: get('message').slice(0, 1000) || null,
    locale: 'nl',
    status: 'confirmed' as const,
  };
  if (!row.date || !row.slot) return;
  const supabase = await getSupabaseServer();
  await supabase.from('bookings').insert(row);
  void audit('booking_create_manual', { date: row.date, slot: row.slot });
  revalidatePath('/admin');
}

// ------------------------------------------------------------ settings
export async function setBookingsClosed(formData: FormData) {
  await requireAdmin();
  const closed = String(formData.get('closed') ?? '') === 'true';
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase
    .from('settings')
    .update({ bookings_closed: closed, updated_at: new Date().toISOString(), updated_by: user?.email ?? null })
    .eq('id', 1);
  void audit('bookings_closed', { closed });
  revalidatePath('/admin');
  revalidatePublic();
}

export async function updateClosedMessages(formData: FormData) {
  await requireAdmin();
  const clip = (v: FormDataEntryValue | null) => String(v ?? '').trim().slice(0, 300);
  const supabase = await getSupabaseServer();
  await supabase
    .from('settings')
    .update({
      closed_message_nl: clip(formData.get('nl')),
      closed_message_fr: clip(formData.get('fr')),
      closed_message_en: clip(formData.get('en')),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  void audit('closed_messages', {});
  revalidatePath('/admin');
  revalidatePublic();
}

// ------------------------------------------------------------ holiday banner
export async function setHolidayActive(formData: FormData) {
  await requireAdmin();
  const active = String(formData.get('active') ?? '') === 'true';
  const supabase = await getSupabaseServer();

  if (active) {
    const { data } = await supabase
      .from('settings')
      .select(
        'holiday_title_nl, holiday_title_fr, holiday_title_en, holiday_message_nl, holiday_message_fr, holiday_message_en',
      )
      .eq('id', 1)
      .single();
    const allTextsFilled = Boolean(
      data?.holiday_title_nl?.trim() &&
        data?.holiday_title_fr?.trim() &&
        data?.holiday_title_en?.trim() &&
        data?.holiday_message_nl?.trim() &&
        data?.holiday_message_fr?.trim() &&
        data?.holiday_message_en?.trim(),
    );
    if (!allTextsFilled) {
      void audit('holiday_active_blocked_incomplete', { active });
      revalidatePath('/admin/banner');
      return;
    }
  }

  await supabase
    .from('settings')
    .update({ holiday_active: active, updated_at: new Date().toISOString() })
    .eq('id', 1);
  void audit('holiday_active', { active });
  revalidatePath('/admin/banner');
  revalidatePublic();
}

export async function updateHoliday(formData: FormData) {
  await requireAdmin();
  const clip = (v: FormDataEntryValue | null, n = 200) => String(v ?? '').trim().slice(0, n);
  const themeRaw = clip(formData.get('theme'), 10);
  const theme = ['summer', 'autumn', 'winter', 'spring'].includes(themeRaw) ? themeRaw : 'summer';
  const publish = String(formData.get('publish') ?? '') === 'true';

  const titleNl = clip(formData.get('title_nl'));
  const titleFr = clip(formData.get('title_fr'));
  const titleEn = clip(formData.get('title_en'));
  const messageNl = clip(formData.get('message_nl'), 400);
  const messageFr = clip(formData.get('message_fr'), 400);
  const messageEn = clip(formData.get('message_en'), 400);
  const allTextsFilled = Boolean(titleNl && titleFr && titleEn && messageNl && messageFr && messageEn);
  const blockWindow = readHolidayBlockWindow(formData);
  if (!blockWindow) {
    void audit('holiday_update_blocked_invalid_dates', {});
    revalidatePath('/admin/banner');
    return;
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [settingsUpdate] = await Promise.all([
    supabase
      .from('settings')
      .update({
        holiday_theme: theme,
        holiday_title_nl: titleNl,
        holiday_title_fr: titleFr,
        holiday_title_en: titleEn,
        holiday_message_nl: messageNl,
        holiday_message_fr: messageFr,
        holiday_message_en: messageEn,
        holiday_active: publish && allTextsFilled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1),
    saveHolidayBlockWindow(supabase, blockWindow, user?.email),
  ]);
  if (settingsUpdate.error) throw settingsUpdate.error;
  void audit('holiday_update', {
    theme,
    publish: publish && allTextsFilled,
    allTextsFilled,
    blockWindow,
  });
  revalidatePath('/admin/banner');
  revalidatePublic();
}
