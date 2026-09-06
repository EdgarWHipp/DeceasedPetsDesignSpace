import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Builder' },
  { href: '/space', label: 'Atlas' },
  { href: '/library', label: 'Library' },
];

export function SiteHeader({ current }: { current: string }) {
  return (
    <header className="mx-auto w-full max-w-5xl px-6 pt-8 pb-4">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-ink text-balance">
            Beyond the Rainbow Bridge: AI Afterlives for Pets
          </h1>
          {current === '/' && (
            <p className="mt-1 text-sm text-ink/60">
              Nine dimensions. Choose a position on each, and see who comes
              back.
            </p>
          )}
        </div>
        <nav className="mr-40 flex shrink-0 gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                current === item.href
                  ? 'bg-ink text-paper'
                  : 'text-ink/70 hover:bg-black/5 hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  // Deliberately unattributed: the paper this accompanies is under anonymous
  // review, so the site names neither the institution nor the repository.
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-ink/50">
      <p>An interactive design space for AI afterlives for pets.</p>
    </footer>
  );
}
