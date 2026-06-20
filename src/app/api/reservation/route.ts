import { NextResponse } from 'next/server';

/**
 * Reservation intake endpoint.
 *
 * - Validates required fields and rejects bots via a honeypot.
 * - Delivers the request by email through Resend's REST API when configured
 *   (set RESEND_API_KEY + RESERVATION_EMAIL; optionally RESERVATION_FROM).
 *   With no email configured it validates + logs so local/dev still works.
 */
export async function POST(request: Request) {
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

  const get = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '');
  const reservation = {
    service: get('service') || 'dinner',
    date: get('date'),
    time: get('time'),
    guests: get('guests') || '—',
    name: get('name'),
    phone: get('phone'),
    email: get('email'),
    occasion: get('occasion'),
    message: get('message'),
  };

  const text = [
    'Nieuwe reservatie-aanvraag — Taste Garden',
    '',
    `Dienst:    ${reservation.service}`,
    `Datum:     ${reservation.date}`,
    `Tijdstip:  ${reservation.time}`,
    `Personen:  ${reservation.guests}`,
    `Naam:      ${reservation.name}`,
    `Telefoon:  ${reservation.phone}`,
    `E-mail:    ${reservation.email}`,
    reservation.occasion ? `Gelegenheid: ${reservation.occasion}` : '',
    reservation.message ? `Opmerking: ${reservation.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESERVATION_EMAIL;
  const from = process.env.RESERVATION_FROM || 'Taste Garden <onboarding@resend.dev>';

  if (apiKey && to) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: reservation.email,
          subject: `Reservatie — ${reservation.name} · ${reservation.guests}p · ${reservation.date} ${reservation.time}`,
          text,
        }),
      });
      if (!res.ok) {
        console.error('[reservation] email send failed', res.status, await res.text());
        return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
      }
    } catch (err) {
      console.error('[reservation] email error', err);
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } else {
    console.info('[reservation] received (email not configured):', reservation);
  }

  return NextResponse.json({ ok: true });
}
