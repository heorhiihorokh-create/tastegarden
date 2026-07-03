export default function AdminLoading() {
  return (
    <div className="admin-root min-h-screen bg-zinc-100 text-zinc-900 antialiased" aria-hidden="true">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col bg-zinc-900 lg:min-h-screen lg:w-60">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="h-3 w-28 rounded-full bg-zinc-700/70" />
            <div className="mt-3 h-4 w-16 rounded-full bg-zinc-700/55" />
          </div>
          <div className="flex flex-1 flex-wrap gap-1 p-3 lg:flex-col lg:flex-nowrap">
            <div className="h-11 rounded-md bg-zinc-800" />
            <div className="h-11 rounded-md bg-zinc-800/45" />
            <div className="h-11 rounded-md bg-zinc-800/35" />
          </div>
          <div className="border-t border-zinc-800 p-3">
            <div className="h-9 rounded-md bg-zinc-800/70" />
          </div>
        </aside>

        <main className="flex-1 bg-zinc-100">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
            <div className="h-9 w-48 rounded-xl bg-zinc-200" />
            <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-6 w-72 rounded-full bg-zinc-200" />
                  <div className="h-4 w-[32rem] max-w-full rounded-full bg-zinc-100" />
                  <div className="h-4 w-[24rem] max-w-full rounded-full bg-zinc-100" />
                </div>
                <div className="h-11 w-40 rounded-xl bg-zinc-200" />
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="h-20 rounded-lg border border-zinc-200 bg-zinc-50" />
                <div className="h-20 rounded-lg border border-zinc-200 bg-zinc-50" />
                <div className="h-20 rounded-lg border border-zinc-200 bg-zinc-50" />
              </div>
            </section>
            <div className="mt-10 flex items-center justify-between gap-4">
              <div className="h-9 w-44 rounded-xl bg-zinc-200" />
              <div className="h-10 w-64 rounded-lg bg-zinc-200" />
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <div className="h-14 border-b border-zinc-200 bg-zinc-50" />
              <div className="h-36 bg-white" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
