'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DIM_BY_ID,
  GROUPS,
  GROUP_ACCENT,
  PRESETS,
  getPosition,
  randomSelection,
  type DimId,
  type Selection,
} from '@/lib/designSpace';
import PetStage from '@/components/PetStage';
import SpiderGraph, { nodePercent } from '@/components/SpiderGraph';
import DimensionPanel from '@/components/DimensionPanel';
import StoryCard from '@/components/StoryCard';
import KioskMode from '@/components/KioskMode';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export default function Builder() {
  const params = useSearchParams();
  const kiosk = params.get('kiosk') === '1';
  const idleSeconds = Number(params.get('idle')) || 75;

  const [selection, setSelection] = useState<Selection>({});
  const [generation, setGeneration] = useState(0);
  const [activeDim, setActiveDim] = useState<DimId | null>(null);
  const [openAccordion, setOpenAccordion] = useState<DimId | null>(null);

  const apply = (sel: Selection) => {
    setSelection(sel);
    setGeneration((g) => g + 1);
    setActiveDim(null);
  };

  const pick = (dim: DimId, posId: string) => {
    setSelection((s) => {
      const next = { ...s };
      if (next[dim] === posId) delete next[dim];
      else next[dim] = posId;
      return next;
    });
    setGeneration((g) => g + 1);
    setActiveDim(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {!kiosk && <SiteHeader current="/" />}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 md:px-6">
        {/* preset bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => apply(preset.selection)}
              title={preset.blurb}
              className="rounded-full border border-black/15 bg-white px-4 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-black/15 sm:block" />
          <button
            onClick={() => apply(randomSelection())}
            className="rounded-full border border-black/15 bg-white px-4 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            Random
          </button>
          <button
            onClick={() => apply({})}
            className="rounded-full px-4 py-1.5 text-sm text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* desktop: radial spider graph around the stage */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[820px] md:block">
          <SpiderGraph
            selection={selection}
            activeDim={activeDim}
            onNodeClick={(dim) =>
              setActiveDim((cur) => (cur === dim ? null : dim))
            }
          />
          <div
            className="absolute"
            style={{ left: '26%', top: '27%', width: '48%', height: '48%' }}
          >
            <PetStage selection={selection} generation={generation} />
          </div>
          {activeDim && (
            <DesktopPanel
              dim={activeDim}
              selection={selection}
              onPick={(posId) => pick(activeDim, posId)}
              onClose={() => setActiveDim(null)}
            />
          )}
        </div>

        {/* mobile: stage + grouped accordion */}
        <div className="md:hidden">
          <div className="mx-auto aspect-square w-full max-w-md">
            <PetStage selection={selection} generation={generation} />
          </div>
          <div className="mt-2 space-y-4">
            {GROUPS.map((group) => (
              <section key={group.name}>
                <h2
                  className="mb-1 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: group.accent }}
                >
                  {group.name}
                </h2>
                <div className="space-y-1.5">
                  {group.dims.map((dimId) => {
                    const dim = DIM_BY_ID[dimId];
                    const chosen = getPosition(selection, dimId);
                    const open = openAccordion === dimId;
                    return (
                      <div
                        key={dimId}
                        className="rounded-lg border border-black/10 bg-white"
                      >
                        <button
                          onClick={() =>
                            setOpenAccordion(open ? null : dimId)
                          }
                          aria-expanded={open}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                        >
                          <span className="text-sm font-medium text-ink">
                            {dim.title}
                          </span>
                          <span
                            className="text-xs italic"
                            style={{
                              color: chosen
                                ? GROUP_ACCENT[dim.group]
                                : '#8b877e',
                            }}
                          >
                            {chosen ? chosen.label : '?'}
                          </span>
                        </button>
                        {open && (
                          <div className="px-2 pb-2">
                            <DimensionPanel
                              dimension={dim}
                              selection={selection}
                              onPick={(posId) => {
                                pick(dimId, posId);
                                setOpenAccordion(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="py-6">
          <StoryCard selection={selection} />
        </div>
      </main>

      {!kiosk && <SiteFooter />}
      <KioskMode
        idleMs={idleSeconds * 1000}
        startActive={kiosk}
        onSpawn={apply}
      />
    </div>
  );
}

function DesktopPanel({
  dim,
  selection,
  onPick,
  onClose,
}: {
  dim: DimId;
  selection: Selection;
  onPick: (posId: string) => void;
  onClose: () => void;
}) {
  const pos = nodePercent(dim);
  // Anchor the popover at the node, growing toward the stage center.
  const style: React.CSSProperties = { width: 300, zIndex: 20 };
  if (pos.x < 50) style.left = `${pos.x}%`;
  else style.right = `${100 - pos.x}%`;
  if (pos.y < 50) style.top = `${pos.y}%`;
  else style.bottom = `${100 - pos.y}%`;
  return (
    <div className="absolute" style={style}>
      <DimensionPanel
        dimension={DIM_BY_ID[dim]}
        selection={selection}
        onPick={onPick}
        onClose={onClose}
      />
    </div>
  );
}
