import Image from 'next/image';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import AlluvialFigure from '@/components/AlluvialFigure';
import GalleryCard from '@/components/GalleryCard';
import { readLibrary } from '@/lib/library';

// The library grows while the site is up, so the page — cards and the diagram
// alike — is built per request rather than frozen at deploy time.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Library',
  description:
    'Every afterlife pet built with the design space, newest first, with the scenario its author had in mind.',
};

export default async function LibraryPage() {
  const entries = await readLibrary();

  return (
    <div className="min-h-dvh">
      <SiteHeader current="/library" />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold text-ink">Library</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Every afterlife pet anyone has built with this design space: one code
            per dimension, plus the scenario its author had in mind. The images
            are generated from those coordinates, by the same builder on the
            front page. Build one and it joins the library, newest first.
          </p>
        </section>

        <section className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
          <AlluvialFigure entries={entries} />
        </section>

        <section className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
          <Image
            src="/figures/sankey-classification.svg"
            alt="Sankey diagram tracing ten concept cards to where each placement landed"
            width={1680}
            height={860}
            className="h-auto w-full min-w-[760px]"
          />
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl font-semibold text-ink">
              Every concept, newest first
            </h3>
            <p className="text-xs text-ink/50">{entries.length} in the library</p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {entries.map((entry) => (
              <GalleryCard key={entry.n} entry={entry} />
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
