import Image from 'next/image';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import GalleryCard, { type GalleryEntry } from '@/components/GalleryCard';
import entries from '@/lib/surveyGallery.json';

export const metadata = {
  title: 'Library',
  description:
    'The seventy concepts survey participants built with the design space, and what the survey found.',
};

const gallery = entries as GalleryEntry[];

const FACTS: { value: string; label: string }[] = [
  { value: '70', label: 'people built their own concept' },
  { value: '57', label: 'distinct nine-code configurations' },
  { value: '49', label: 'chose a combination nobody else chose' },
  { value: '53', label: 'built an ongoing companion, against 17 replay or keepsake designs' },
];

export default function LibraryPage() {
  const withText = gallery.filter((e) => e.text).length;

  return (
    <div className="min-h-dvh">
      <SiteHeader current="/library" />
      <main className="mx-auto w-full max-w-5xl px-6 pb-16">
        <section className="max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold text-ink">Library</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Seventy people who had never seen this design space were asked to
            build their own afterlife pet with it, one code per dimension, and
            then to describe the idea in their own words. Every concept below is
            theirs. The images are generated from their own coordinates, by the
            same builder on the front page.
          </p>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FACTS.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-black/10 bg-white/60 p-4"
            >
              <p className="font-serif text-3xl font-semibold text-ink">
                {f.value}
              </p>
              <p className="mt-1 text-xs leading-snug text-ink/60">{f.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h3 className="font-serif text-xl font-semibold text-ink">
            What the seventy built
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
            One band per participant, carried across all nine dimensions and
            coloured by the Form they chose, so a single concept can be followed
            the whole way across. Every column totals seventy. The pull toward an
            active, ongoing companion is the clearest single result of the task.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
            <Image
              src="/figures/sankey-own-all-dimensions.svg"
              alt="Alluvial diagram following each of the seventy own concepts across all nine design space dimensions"
              width={1900}
              height={1160}
              className="h-auto w-full min-w-[960px]"
            />
          </div>
        </section>

        <section className="mt-12">
          <h3 className="font-serif text-xl font-semibold text-ink">
            Classifying ten concepts with the space
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
            Before building their own, participants classified concept cards
            written by the researcher. Every cell those judgments produced is
            traced here. The last row is the one to read: that card was
            deliberately unmappable, and most raters coded it anyway rather than
            answering &ldquo;Does not apply&rdquo;.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2">
            <Image
              src="/figures/sankey-classification.svg"
              alt="Sankey diagram tracing 630 classification cells from ten concept cards to their outcomes"
              width={2000}
              height={1160}
              className="h-auto w-full min-w-[720px]"
            />
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl font-semibold text-ink">
              The seventy concepts
            </h3>
            <p className="text-xs text-ink/50">
              {withText} of {gallery.length} wrote a description
            </p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((entry) => (
              <GalleryCard key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
