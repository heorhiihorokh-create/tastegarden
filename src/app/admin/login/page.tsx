import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // Already signed in as admin → straight to the dashboard.
  if (await getAdminUser()) redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
        <div className="mb-6">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c1272d]">Taste Garden</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Beheer — inloggen</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Log in om reservaties te beheren. Alleen voor de eigenaar.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
