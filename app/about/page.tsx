import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About the design space for XR and technology-mediated representations of deceased companion animals.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader current="/about" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6">
        <h2 className="font-serif text-lg font-semibold text-ink">About this design space</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          Losing a companion animal is, for many people, losing a family
          member. Emerging technologies — extended reality, robotics,
          interactive media — open a wide range of ways a deceased pet can be
          represented, remembered, and encountered again. This design space
          maps that range. It was developed through a series of design
          workshops in which participants ideated, sketched, and discussed
          concepts for technology-mediated representations of deceased
          companion animals; the resulting concepts were then synthesized and
          evaluated into a shared structure.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          The synthesis yields nine dimensions in three groups — how the pet is
          made present (Manifestation), how the owner can encounter and act
          with it (Interaction), and how the representation is created, how the
          bond continues, and who can take part (Afterlife). Each dimension
          offers two to four positions; combined, they describe 5,184 possible
          configurations. The interactive builder on the front page lets you
          explore them one pet at a time; the atlas shows the full space at
          once.
        </p>
        <p className="mt-6 text-sm text-ink/70">
          Master&apos;s thesis at Karlsruhe Institute of Technology (KIT), 2026.
        </p>
        <p className="mt-2 text-sm text-ink/70">
          Source code:{' '}
          <a
            href="https://github.com/EdgarWHipp/DeceasedPetsDesignSpace"
            className="underline hover:text-ink"
          >
            github.com/EdgarWHipp/DeceasedPetsDesignSpace
          </a>
        </p>
        <div className="mt-8 rounded-xl border border-black/10 bg-white/70 p-5">
          <h3 className="font-serif text-sm font-semibold text-ink">Citation</h3>
          <p className="mt-2 text-sm italic text-ink/60">
            Thesis citation to be added upon publication.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
