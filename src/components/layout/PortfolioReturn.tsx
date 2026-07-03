'use client';

const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL;

export function PortfolioReturn() {
  if (!portfolioUrl) return null;

  const markReturn = () => {
    try {
      window.sessionStorage.setItem('aomi:return-to-projects', '1');
    } catch {
      // The URL hash remains a safe fallback when storage is unavailable.
    }
  };

  return (
    <a
      href={portfolioUrl}
      onClick={markReturn}
      aria-label="Return to AOMI portfolio"
      className="group fixed bottom-4 left-4 z-[100] flex items-center gap-3 rounded-full border border-cream/15 bg-ink/90 px-4 py-3 text-cream shadow-lift backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-ember/60 sm:bottom-6 sm:left-6 sm:px-5"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ember/35 bg-ember/10 text-lg text-ember transition-transform duration-300 group-hover:-translate-x-0.5"
      >
        ←
      </span>
      <span className="flex flex-col">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ember">
          Back to AOMI
        </span>
        <span className="text-[0.64rem] tracking-[0.12em] text-cream/55">
          portfolio
        </span>
      </span>
    </a>
  );
}
