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
        <h2 className="font-serif text-lg font-semibold text-ink">More on this research</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          Companion animals hold a clear place in everyday life, and their
          loss can bring serious grief that is still socially
          under-acknowledged. Research on digital afterlife technologies has
          mostly focused on deceased humans; deceased companion animals remain
          far less examined. This thesis addresses that gap by developing a
          design space for Extended Reality (XR) and adjacent
          technology-mediated representations of deceased companion animals.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          The work uses speculative design: two design workshops generated
          concepts, sketches, stories, and critiques of imagined posthumous
          pet representations, which were analyzed through reflexive thematic
          analysis. Rather than treating technical feasibility as the main
          constraint, the workshops used speculation to open discussion about
          which forms of presence, recognition, continuity, and control might
          feel comforting, unsettling, or unacceptable.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          The findings range from sensory traces and place-based replay to
          ongoing digital companions and transition-oriented services &mdash;
          and they show that posthumous pet representation is not simply a
          matter of immersive visualization. What mattered was how a system
          made the pet recognizable, where and when it appeared, how strongly
          technology mediated the encounter, and what kind of continuity after
          loss it supported. These findings were synthesized into the
          nine-dimensional design space this site explores; a follow-up survey
          evaluated it as a classification artifact.
        </p>
        <figure className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/workshops/leipzig-workshop.jpg"
              alt="Speculative design workshop in Leipzig: participants working in small groups at standing tables"
              className="aspect-[4/3] w-full rounded-xl border border-black/10 object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/workshops/munich-workshop.jpg"
              alt="Speculative design workshop in Munich: participants at a whiteboard with a futures wheel and futures cone"
              className="aspect-[4/3] w-full rounded-xl border border-black/10 object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-ink/50">
            The two speculative design workshops. Left: Albertina Library,
            Leipzig (9&nbsp;May&nbsp;2026). Right: University Library, Technical
            University of Munich (8&nbsp;June&nbsp;2026). Participant faces are
            blurred.
          </figcaption>
        </figure>
        <p className="mt-8 text-sm font-medium text-ink/80">
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
          (CC0), via poly.pizza. Realistic dog model &ldquo;Beagle&rdquo; by{' '}
          <a
            href="https://poly.pizza/m/0BnDT3T1wTE"
            className="underline hover:text-ink"
          >
            Poly by Google
          </a>{' '}
          (CC-BY 3.0), via poly.pizza.
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
