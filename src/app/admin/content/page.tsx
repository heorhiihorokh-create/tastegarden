import { requireAdmin } from '@/lib/admin/auth';
import { getEditableSections } from '@/lib/content';
import Link from 'next/link';
import { AdminShell } from '../AdminShell';
import { saveContent, resetContent } from '../content-actions';

export const dynamic = 'force-dynamic';

const LOCALES = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'fr', label: 'Frans' },
  { code: 'en', label: 'Engels' },
] as const;

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string }>;
}) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const loc = (['nl', 'fr', 'en'] as const).includes(sp.loc as 'nl') ? (sp.loc as 'nl' | 'fr' | 'en') : 'nl';

  const sections = await getEditableSections(loc);
  const input =
    'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900';

  return (
    <AdminShell active="content" email={user.email}>
      <h1 className="text-2xl font-semibold text-zinc-900">Teksten van de website</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        Uitleg: kies een taal, open een sectie en pas een tekst of nummer aan. Klik “Opslaan” — de
        wijziging verschijnt meteen op de website (bv. een ander telefoonnummer). “Standaard” zet de
        originele tekst terug.
      </p>

      {/* Language selector */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {LOCALES.map((l) => (
          <Link
            key={l.code}
            href={`/admin/content?loc=${l.code}`}
            prefetch
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              loc === l.code ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-3">
        {sections.map((section) => {
          const overrides = section.fields.filter((f) => f.isOverride).length;
          return (
            <details
              key={section.namespace}
              className="admin-editor-section overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
                <span>
                  {section.label}
                  <span className="ml-2 font-normal text-zinc-400">({section.fields.length})</span>
                </span>
                {overrides > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {overrides} aangepast
                  </span>
                )}
              </summary>

              <div className="divide-y divide-zinc-100 border-t border-zinc-200">
                {section.fields.map((f) => (
                  <form
                    key={f.key}
                    action={saveContent}
                    className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-start"
                  >
                    <input type="hidden" name="key" value={f.key} />
                    <input type="hidden" name="locale" value={loc} />
                    <div className="w-full shrink-0 pt-1.5 sm:w-56">
                      <div className="break-words font-mono text-xs text-zinc-500">{f.label}</div>
                      {f.isNumber && <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400">nummer</span>}
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      {f.long ? (
                        <textarea name="value" defaultValue={f.value} rows={2} className={input} />
                      ) : (
                        <input name="value" defaultValue={f.value} inputMode={f.isNumber ? 'decimal' : undefined} className={input} />
                      )}
                      <div className="flex items-center gap-2">
                        <button className="rounded-md bg-[#c1272d] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#a81f25]">
                          Opslaan
                        </button>
                        {f.isOverride && (
                          <button
                            formAction={resetContent}
                            className="rounded-md border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                          >
                            Standaard
                          </button>
                        )}
                        {f.isOverride && <span className="text-xs font-medium text-amber-600">aangepast</span>}
                      </div>
                    </div>
                  </form>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </AdminShell>
  );
}
