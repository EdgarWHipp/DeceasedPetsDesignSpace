import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Builder' },
  { href: '/space', label: 'Atlas' },
  { href: '/about', label: 'About' },
];

export function SiteHeader({ current }: { current: string }) {
  return (
    <header className="mx-auto w-full max-w-5xl px-6 pt-8 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-ink text-balance">
            A Design Space for Representations of Deceased Companion Animals
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Nine dimensions, 5184 possible pets — pick a position on each and
            see who comes back.
          </p>
        </div>
        <nav className="flex gap-1 text-sm">
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
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-ink/50">
      <p>
        Developed as part of a Master&apos;s thesis at Karlsruhe Institute of
        Technology (KIT) ·{' '}
        <a
          href="https://github.com/EdgarWHipp/DeceasedPetsDesignSpace"
          className="underline hover:text-ink"
        >
          Source on GitHub
        </a>
      </p>
    </footer>
  );
}
