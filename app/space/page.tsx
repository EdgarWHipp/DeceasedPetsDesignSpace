import type { Metadata } from 'next';
import { DIMENSIONS, GROUPS, TOTAL_CONFIGURATIONS } from '@/lib/designSpace';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Design Space Atlas',
  description:
    'The full nine-dimension design space of technology-mediated representations of deceased companion animals.',
};

export default function SpacePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader current="/space" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <p className="max-w-3xl text-sm text-ink/70">
          The complete design space: three groups, nine dimensions,{' '}
          {TOTAL_CONFIGURATIONS.toLocaleString('en-US')} possible
          configurations. The figure below is the thesis overview with one
          visual example per position — click it to open the full-resolution
          vector in a new tab.
        </p>
        <a
          href="/design_space_visual_examples.svg"
          target="_blank"
          rel="noopener"
          className="mt-4 block rounded-xl border border-black/10 bg-white p-2"
          title="Open the full-resolution figure in a new tab"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/design_space_visual_examples.svg"
            alt="Thesis figure: the nine-dimension design space with visual examples per position"
            className="h-auto w-full"
          />
        </a>

        {GROUPS.map((group) => (
          <section key={group.name} className="mt-12">
            <h2
              className="text-lg font-semibold tracking-wide"
              style={{ color: group.accent }}
            >
              {group.name}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-ink/70">
              {group.description}
            </p>
            {group.dims.map((dimId) => {
              const dim = DIMENSIONS.find((d) => d.id === dimId)!;
              return (
                <div key={dim.id} className="mt-6">
                  <h3 className="text-base font-semibold text-ink">
                    {dim.id} — {dim.title}
                  </h3>
                  <p className="text-sm text-ink/60">{dim.question}</p>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-black/15 text-left text-xs uppercase tracking-wider text-ink/50">
                          <th className="py-2 pr-4 font-medium">Position</th>
                          <th className="py-2 pr-4 font-medium">Definition</th>
                          <th className="py-2 font-medium">Examples</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dim.positions.map((pos) => (
                          <tr key={pos.id} className="border-b border-black/5 align-top">
                            <td className="py-2 pr-4 font-medium whitespace-nowrap">
                              {pos.label}
                            </td>
                            <td className="py-2 pr-4 text-ink/80">{pos.definition}</td>
                            <td className="py-2 text-ink/60">{pos.examples.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
