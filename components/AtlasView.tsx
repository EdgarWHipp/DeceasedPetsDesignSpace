'use client';

import { useState } from 'react';
import { DIMENSIONS, GROUPS } from '@/lib/designSpace';

type Variant = 'visual' | 'text';

export default function AtlasView() {
  const [variant, setVariant] = useState<Variant>('text');

  return (
    <div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6">
        <p className="max-w-3xl text-sm text-ink/70">
          The complete design space: three groups, nine dimensions.
        </p>
        <div
          role="tablist"
          aria-label="Atlas variant"
          className="flex w-fit items-center gap-1 rounded-full border border-black/15 bg-white p-1"
        >
          {(
            [
              ['text', 'Text'],
              ['visual', 'Visual'],
            ] as [Variant, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={variant === id}
              onClick={() => setVariant(id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                variant === id
                  ? 'bg-ink text-paper'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {variant === 'visual' ? (
        /* Visual atlas: the thesis figure, one visual example per position,
           full page width. */
        <div className="mx-auto mt-6 w-full max-w-[1800px] px-4">
          <a
            href="/design_space_visual_examples.svg"
            target="_blank"
            rel="noopener"
            className="block rounded-xl border border-black/10 bg-white p-2"
            title="Open the full-resolution figure in a new tab"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/design_space_visual_examples.svg"
              alt="Thesis figure: the nine-dimension design space with visual examples per position"
              className="h-auto w-full"
            />
          </a>
        </div>
      ) : (
        /* Text atlas: definitions and examples per position. */
        <div className="mx-auto w-full max-w-5xl px-6">
          {GROUPS.map((group) => (
            <section key={group.name} className="mt-10">
              <h2
                className="font-serif text-lg font-semibold tracking-wide"
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
                    <h3 className="font-serif text-base font-semibold text-ink">
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
                            <tr
                              key={pos.id}
                              className="border-b border-black/5 align-top"
                            >
                              <td className="py-2 pr-4 font-medium whitespace-nowrap">
                                {pos.label}
                              </td>
                              <td className="py-2 pr-4 text-ink/80">
                                {pos.definition}
                              </td>
                              <td className="py-2 text-ink/60">
                                {pos.examples.join(', ')}
                              </td>
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
        </div>
      )}
    </div>
  );
}
