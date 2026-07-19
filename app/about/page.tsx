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
          maps that range. It grew out of a series of design workshops:
          participants sketched and discussed concepts for technology-mediated
          representations of deceased companion animals, and those concepts
          were then synthesized into the shared structure presented here.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          The synthesis yields nine dimensions in three groups — how the pet is
          made present (Manifestation), how the owner can encounter and act
          with it (Interaction), and how the representation is created, how the
          bond continues, and who can take part (Afterlife). Each dimension
          offers two to four positions; together they describe 5,184 possible
          configurations. The builder explores them one pet at a time; the
          atlas lays out the whole space.
        </p>
        <p className="mt-6 text-sm font-medium text-ink/80">
          Edgar Hipp, Dr.-Ing. Martin Feick, M.Sc. Shi Liu, Prof. Dr. Alexander
          Mädche
        </p>
        <p className="mt-1 text-sm text-ink/70">
          Master&apos;s Thesis · Human-Centered Systems Lab (h-lab), WIN,
          Karlsruhe Institute of Technology (KIT) · 2026
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
        <p className="mt-2 text-sm text-ink/70">
          3D dog model by{' '}
          <a href="https://quaternius.com" className="underline hover:text-ink">
            Quaternius
          </a>{' '}
          (CC0), via poly.pizza.
        </p>
        <div className="mt-8 rounded-xl border border-black/10 bg-white p-5">
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
