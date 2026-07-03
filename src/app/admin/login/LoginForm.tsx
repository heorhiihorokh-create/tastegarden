'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from '../actions';

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Wachtwoord
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-[#c1272d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a81f25] disabled:opacity-60"
      >
        {pending ? 'Bezig met inloggen…' : 'Inloggen'}
      </button>
    </form>
  );
}
