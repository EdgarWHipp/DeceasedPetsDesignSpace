'use client';

// One survey participant's own concept. Collapsed it shows only the
// Manifestation image, which is the same PetStage the builder renders, driven
// by that participant's own D1-D3 codes. Expanded it adds the other six
// dimensions and the text they wrote.

import { useState } from 'react';
import { DIM_BY_ID, GROUPS, GROUP_ACCENT } from '@/lib/designSpace';
import type { DimId, Selection } from '@/lib/designSpace';
import PetStage from '@/components/PetStage';

export interface GalleryEntry {
  id: string;
  codes: Partial<Record<DimId, string>>;
  text: string;
}

const labelFor = (dim: DimId, posId?: string) => {
  if (!posId) return 'Not specified';
  const d = DIM_BY_ID[dim];
  return d?.positions.find((p) => p.id === posId)?.label ?? 'Not specified';
};

export default function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const [open, setOpen] = useState(false);
  const selection = entry.codes as Selection;
  const manifestation = GROUPS[0];

  return (
    <li className="rounded-2xl border border-black/10 bg-white/60 p-3">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-white">
        <PetStage selection={selection} generation={0} preset={null} />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">{entry.id}</p>
        <p className="text-xs text-ink/50">
          {manifestation.dims
            .map((d) => labelFor(d, entry.codes[d]))
            .join(' · ')}
        </p>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 w-full rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:bg-black/5 hover:text-ink"
      >
        {open ? 'Collapse' : 'Expand'}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {GROUPS.slice(1).map((g) => (
            <div key={g.name}>
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: GROUP_ACCENT[g.name] }}
              >
                {g.name}
              </p>
              <dl className="mt-1 space-y-0.5">
                {g.dims.map((d) => (
                  <div key={d} className="flex justify-between gap-3 text-xs">
                    <dt className="text-ink/50">{DIM_BY_ID[d]?.title ?? d}</dt>
                    <dd className="text-right text-ink">
                      {labelFor(d, entry.codes[d])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          {entry.text && (
            <blockquote className="border-l-2 border-black/10 pl-3 text-xs leading-relaxed text-ink/75">
              {entry.text}
            </blockquote>
          )}
        </div>
      )}
    </li>
  );
}
