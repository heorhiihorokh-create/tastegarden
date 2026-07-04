import { NextResponse } from 'next/server';
import { isValidReservationSlot, normalizeService } from '@/lib/openingSchedule';
import { getScheduleConfig } from '@/lib/scheduleConfig.server';
import { getSupabaseAnon, supabaseConfigured, withTimeout } from '@/lib/supabase/server';
import { holidayAnnouncementBlocksReservations } from '@/lib/holidayCopy';
import {
  EMPTY_HOLIDAY_BLOCK_WINDOW,
  HOLIDAY_BLOCK_SETTING_KEYS,
  HOLIDAY_BLOCK_SETTINGS_LOCALE,
  isDateInHolidayBlockWindow,
  holidayBlockWindowFromRows,
} from '@/lib/holidayBlockWindow';

/**
 * Reservation intake endpoint.
 *
 * Flow: honeypot → rate-limit → validate fields & slot → refuse if bookings are
 * globally closed → persist as a `pending` booking → email the restaurant and a
 * confirmation to the guest (when Resend is configured). Degrades gracefully:
 * with no DB/email configured it still validates so local dev keeps working.
 */

export const runtime = 'nodejs';

// --- tiny in-memory rate limiter (per server instance; basic abuse guard) ---
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear(); // guard against unbounded growth
  return recent.length > MAX_PER_WINDOW;
}

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot — real users never fill this hidden field. Silently accept & drop.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const required = ['date', 'time', 'name', 'phone', 'email'] as const;
  const missing = required.filter((key) => {
    const value = body[key];
    return typeof value !== 'string' || value.trim() === '';
  });
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: 'missing_fields', missing }, { status: 422 });
  }

  const service = normalizeService(body.service) ?? 'dinner';
  const email = clean(body.email, 160);
  const localeRaw = clean(body.locale, 2).toLowerCase();
  const locale = (['nl', 'fr', 'en'] as const).includes(localeRaw as 'nl') ? localeRaw : 'nl';
  const guestsNum = Math.trunc(Number(clean(body.guests, 4)));
  const reservation = {
    service,
    date: clean(body.date, 10),
    time: clean(body.time, 8),
    guests: Number.isFinite(guestsNum) && guestsNum >= 1 && guestsNum <= 40 ? guestsNum : NaN,
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email,
    message: clean(body.message, 1000),
    locale,
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservation.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 });
  }
  if (!Number.isFinite(reservation.guests)) {
    return NextResponse.json({ ok: false, error: 'invalid_guests' }, { status: 422 });
  }
  const schedule = await getScheduleConfig();
  if (!isValidReservationSlot(reservation.date, reservation.service, reservation.time, schedule)) {
    return NextResponse.json({ ok: false, error: 'invalid_reservation_time' }, { status: 422 });
  }

  // --- Persist + refuse when bookings are globally closed (server-authoritative) ---
  if (supabaseConfigured()) {
    try {
      const supabase = getSupabaseAnon();
      const [settingsResult, windowResult] = await withTimeout(
        Promise.all([
          supabase
            .from('settings')
            .select('bookings_closed, holiday_active')
            .eq('id', 1)
            .single(),
          supabase
            .from('content_overrides')
            .select('key, value')
            .eq('locale', HOLIDAY_BLOCK_SETTINGS_LOCALE)
            .in('key', [...HOLIDAY_BLOCK_SETTING_KEYS]),
        ]),
      );
      const settings = settingsResult.data;
      const blockWindow = windowResult.error
        ? EMPTY_HOLIDAY_BLOCK_WINDOW
        : holidayBlockWindowFromRows(windowResult.data);
      if (
        holidayAnnouncementBlocksReservations({
          active: Boolean(settings?.holiday_active),
          blockWindow,
        }) ||
        (settings?.holiday_active && isDateInHolidayBlockWindow(reservation.date, blockWindow))
      ) {
        return NextResponse.json({ ok: false, error: 'holiday_closed' }, { status: 423 });
      }
      if (settings?.bookings_closed) {
        return NextResponse.json({ ok: false, error: 'bookings_closed' }, { status: 423 });
      }

      const { error: insertError } = await withTimeout(
        supabase.from('bookings').insert({
          service: reservation.service,
          date: reservation.date,
          slot: reservation.time,
          guests: reservation.guests,
          name: reservation.name,
          email: reservation.email,
          phone: reservation.phone,
          message: reservation.message || null,
          locale: reservation.locale,
          status: 'pending',
        }),
        4500,
      );
      if (insertError) {
        console.error('[reservation] db insert failed', insertError.message);
        return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 502 });
      }
    } catch (err) {
      console.error('[reservation] db error', err);
      return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 502 });
    }
  }

  // --- Email (restaurant notification + guest confirmation) via Resend ---
  // A persisted booking is authoritative (the restaurant sees it in the admin),
  // so a failed notification email must NOT fail the request — otherwise the guest
  // may resubmit and create duplicates. Only hard-fail when nothing was saved.
  const saved = supabaseConfigured();
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESERVATION_EMAIL;
  const from = process.env.RESERVATION_FROM || 'Taste Garden <onboarding@resend.dev>';

  const summary = [
    `Dienst:    ${reservation.service}`,
    `Datum:     ${reservation.date}`,
    `Tijdstip:  ${reservation.time}`,
    `Personen:  ${reservation.guests}`,
    `Naam:      ${reservation.name}`,
    `Telefoon:  ${reservation.phone}`,
    `E-mail:    ${reservation.email}`,
    reservation.message ? `Opmerking: ${reservation.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (apiKey && to) {
    const send = (payload: Record<string, unknown>) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

    const restaurantPayload = {
      from,
      to: [to],
      reply_to: reservation.email,
      subject: `Reservatie — ${reservation.name} · ${reservation.guests}p · ${reservation.date} ${reservation.time}`,
      text: `Nieuwe reservatie-aanvraag — Taste Garden\n\n${summary}`,
    };
    const guestPayload = {
      from,
      to: [reservation.email],
      subject: 'Wij hebben uw reservatie-aanvraag ontvangen — Taste Garden',
      text:
        `Beste ${reservation.name},\n\n` +
        `Bedankt voor uw reservatie-aanvraag bij Taste Garden. Wij hebben uw aanvraag ontvangen ` +
        `en bevestigen deze zo snel mogelijk.\n\n${summary}\n\n` +
        `Indien u geen e-mail ontvangt, controleer uw spam-map.\n\n` +
        `Kortrijksestraat 276, 8870 Izegem · 051 30 38 88`,
    };

    if (saved) {
      // Booking already persisted → both emails are best-effort notifications.
      // Send them in parallel so the guest isn't stuck on "sending" for two
      // sequential Resend round trips.
      const [restaurantResult, guestResult] = await Promise.allSettled([
        send(restaurantPayload),
        send(guestPayload),
      ]);
      if (restaurantResult.status === 'rejected') {
        console.error('[reservation] restaurant email error', restaurantResult.reason);
      } else if (!restaurantResult.value.ok) {
        console.error(
          '[reservation] restaurant email failed',
          restaurantResult.value.status,
          await restaurantResult.value.text(),
        );
      }
      if (guestResult.status === 'rejected') {
        console.error('[reservation] guest email error', guestResult.reason);
      }
    } else {
      // No DB configured: the restaurant email IS the booking — it must succeed
      // before we confirm anything to the guest.
      try {
        const restaurantRes = await send(restaurantPayload);
        if (!restaurantRes.ok) {
          console.error('[reservation] restaurant email failed', restaurantRes.status, await restaurantRes.text());
          return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
        }

        // Guest confirmation (best-effort — failure here must not fail the booking).
        await send(guestPayload).catch((e) => console.error('[reservation] guest email error', e));
      } catch (err) {
        console.error('[reservation] email error', err);
        return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
      }
    }
  } else {
    console.info('[reservation] saved (email not configured):', reservation);
  }

  return NextResponse.json({ ok: true });
}
