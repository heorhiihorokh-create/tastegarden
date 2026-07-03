import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOutAction } from './actions';
import { AdminRouteWarmup } from './AdminRouteWarmup';

const iconStyle = { width: '1rem', height: '1rem', flexShrink: 0 } as const;

function IconBookings() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="admin-nav-icon h-4 w-4 shrink-0"
      style={iconStyle}
      aria-hidden
      focusable="false"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconContent() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="admin-nav-icon h-4 w-4 shrink-0"
      style={iconStyle}
      aria-hidden
      focusable="false"
    >
      <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 3.5V8h4.5M8 12h8M8 15.5h8M8 8.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconBanner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="admin-nav-icon h-4 w-4 shrink-0"
      style={iconStyle}
      aria-hidden
      focusable="false"
    >
      <path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5l-6 4H5a1 1 0 0 0-1 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { key: 'bookings', href: '/admin', label: 'Reservaties', Icon: IconBookings },
  { key: 'banner', href: '/admin/banner', label: 'Aankondiging', Icon: IconBanner },
  { key: 'content', href: '/admin/content', label: 'Teksten', Icon: IconContent },
] as const;

/** Back-office shell with a WordPress-style dark left sidebar. */
export function AdminShell({
  active,
  email,
  children,
}: {
  active: 'bookings' | 'banner' | 'content';
  email?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminRouteWarmup />
      <aside className="flex shrink-0 flex-col bg-zinc-900 text-zinc-300 lg:min-h-screen lg:w-60">
        <div className="border-b border-zinc-800 px-5 py-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#e0796b]">Taste Garden</p>
          <p className="text-sm font-semibold text-white">Beheer</p>
        </div>

        <nav className="flex flex-1 flex-wrap gap-1 p-3 lg:flex-col lg:flex-nowrap">
          {NAV.map(({ key, href, label, Icon }) => {
            const isActive = active === key;
            return (
              <Link
                key={key}
                href={href}
                prefetch
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          {email && <p className="mb-2 truncate px-2 text-xs text-zinc-500">{email}</p>}
          <form action={signOutAction}>
            <button className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700">
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
