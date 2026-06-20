import { NextResponse } from 'next/server';

/**
 * Reservation intake endpoint (stub).
 *
 * Validates the payload and acknowledges the request. Wire this to an email
 * provider (e.g. Resend) or the restaurant's booking system before going live —
 * the front-end already speaks this contract.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const required = ['date', 'time', 'name', 'phone', 'email'] as const;
  const missing = required.filter((key) => {
    const value = body[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: 'missing_fields', missing }, { status: 422 });
  }

  // TODO: deliver the reservation (email / booking API).
  console.info('[reservation] new request', {
    date: body.date,
    time: body.time,
    guests: body.guests,
    name: body.name,
  });

  return NextResponse.json({ ok: true });
}
