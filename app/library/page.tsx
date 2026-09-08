import Image from 'next/image';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import GalleryCard from '@/components/GalleryCard';
import { readLibrary } from '@/lib/library';

// The library grows while the site is up, so the page is built per request
// rather than frozen at deploy time.
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
      <main className="pb-16">
        <section className="mx-auto w-full max-w-5xl px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink">Library</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
            Every afterlife pet anyone has built with this design space: one code
            per dimension, plus the scenario its author had in mind. The images
            are generated from those coordinates, by the same builder on the
            front page. Build one and it joins the library, newest first.
          </p>
        </section>

        <section className="mx-auto mt-10 w-full max-w-[1800px] px-4">
          <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
            <Image
              src="/figures/sankey-own-all-dimensions.svg"
              alt="Alluvial diagram following every concept in the library across all nine design space dimensions"
              width={2200}
              height={1560}
              className="h-auto w-full min-w-[960px]"
            />
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-[1800px] px-4">
          <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
            <Image
              src="/figures/sankey-classification.svg"
              alt="Sankey diagram tracing ten concept cards to where each placement landed"
              width={2200}
              height={1320}
              className="h-auto w-full min-w-[820px]"
            />
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-5xl px-6">
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
