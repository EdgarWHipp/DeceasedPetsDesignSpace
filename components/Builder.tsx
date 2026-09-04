'use client';

import { Fragment, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DIM_BY_ID,
  GROUPS,
  GROUP_ACCENT,
  getPosition,
  type DimId,
  type GroupName,
  type Selection,
} from '@/lib/designSpace';
import GroupStage from '@/components/GroupStage';
import DimensionPanel from '@/components/DimensionPanel';
import StoryCard from '@/components/StoryCard';
import AddToLibrary from '@/components/AddToLibrary';
import KioskMode from '@/components/KioskMode';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export default function Builder() {
  const params = useSearchParams();
  const kiosk = params.get('kiosk') === '1';
  const idleSeconds = Number(params.get('idle')) || 75;

  const [selection, setSelection] = useState<Selection>({});
  const [generation, setGeneration] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<DimId | null>(null);
  // The bespoke preset vignette (candle / holo projector / arena) shows only
  // when a preset was *explicitly* chosen — a preset button (or the kiosk
  // attract). Building the same nine-dimension combination by hand is a
  // participant's own design, so it stays a neutral pet; any manual pick clears
  // this.
  const [presetName, setPresetName] = useState<string | null>(null);

  // The spawn pulse (generation) only fires when the pet's own visuals
  // change: Manifestation dims D1-D3. Interaction and Afterlife picks
  // update their own diagram without re-spawning the 3D pet.
  const VISUAL_DIMS: DimId[] = ['D1', 'D2', 'D3'];

  const apply = (sel: Selection, name: string | null = null) => {
    if (VISUAL_DIMS.some((d) => selection[d] !== sel[d]))
      setGeneration((g) => g + 1);
    setSelection(sel);
    setPresetName(name);
    setOpenAccordion(null);
  };

  const pick = (dim: DimId, posId: string) => {
    setSelection((s) => {
      const next = { ...s };
      if (next[dim] === posId) delete next[dim];
      else next[dim] = posId;
      return next;
    });
    if (VISUAL_DIMS.includes(dim)) setGeneration((g) => g + 1);
    setPresetName(null);
  };

  // The builder starts empty ("?" everywhere) and stays exactly as the visitor
  // leaves it — no idle auto-cycling through the preset representations. (Kiosk
  // mode still runs its own full-screen attract via KioskMode.)

  const controlsFor = (group: (typeof GROUPS)[number]) => (
    <GroupControls
      group={group}
      selection={selection}
      openAccordion={openAccordion}
      setOpenAccordion={setOpenAccordion}
      onPick={pick}
    />
  );

  return (
    <div className="flex min-h-screen flex-col">
      {!kiosk && <SiteHeader current="/" />}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-6">
        {/* A single nine-dimension pick can't honestly be one picture, so the
            builder shows one image per group — Manifestation (the 3D pet, with
            its preset vignette), Interaction and Afterlife (SVG diagrams) — each
            driven by its own three dimensions, with that group's controls below.
            Desktop: an aligned image row (joined by flow arrows) over a controls
            row. Mobile: each group stacked. */}

        {/* desktop */}
        <div className="mx-auto hidden w-full max-w-5xl md:block">
          {/* image row with flow-arrow connectors */}
          <div className="flex items-center">
            {GROUPS.map((group, i) => (
              <Fragment key={group.name}>
                <div className="min-w-0 flex-1">
                  <GroupStage
                    group={group}
                    selection={selection}
                    generation={generation}
                    preset={presetName}
                  />
                </div>
                {i < GROUPS.length - 1 && <FlowArrow />}
              </Fragment>
            ))}
          </div>
          {/* controls row, columns aligned under their images */}
          <div className="mt-4 flex items-start">
            {GROUPS.map((group, i) => (
              <Fragment key={group.name}>
                <div className="min-w-0 flex-1">{controlsFor(group)}</div>
                {i < GROUPS.length - 1 && (
                  <div className="w-10 shrink-0" aria-hidden />
                )}
              </Fragment>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <AddToLibrary selection={selection} />
          </div>
          <div className="mx-auto max-w-2xl py-8">
            <StoryCard selection={selection} />
          </div>
        </div>

        {/* mobile: each group stacked — image over its controls */}
        <div className="mt-2 space-y-8 md:hidden">
          {GROUPS.map((group) => (
            <section key={group.name}>
              <div className="mx-auto mb-3 aspect-square w-full max-w-xs">
                <GroupStage
                  group={group}
                  selection={selection}
                  generation={generation}
                  preset={presetName}
                />
              </div>
              {controlsFor(group)}
            </section>
          ))}
          <div className="py-2">
            <StoryCard selection={selection} />
          </div>
        </div>
      </main>

      {!kiosk && <SiteFooter />}
      {kiosk && (
        <KioskMode
          idleMs={idleSeconds * 1000}
          startActive={kiosk}
          onSpawn={apply}
        />
      )}
    </div>
  );
}

/** Directional connector drawn between two group images in the desktop row. */
function FlowArrow() {
  return (
    <div className="flex w-10 shrink-0 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink/30">
        <path
          d="M4 12h13M12 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** One group's dimension pickers as an accordion, below its image. */
function GroupControls({
  group,
  selection,
  openAccordion,
  setOpenAccordion,
  onPick,
}: {
  group: { name: GroupName; dims: DimId[] };
  selection: Selection;
  openAccordion: DimId | null;
  setOpenAccordion: (dim: DimId | null) => void;
  onPick: (dim: DimId, posId: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {group.dims.map((dimId) => {
        const dim = DIM_BY_ID[dimId];
        const chosen = getPosition(selection, dimId);
        const open = openAccordion === dimId;
        return (
          <div key={dimId} className="rounded-lg border border-black/10 bg-white">
            <button
              onClick={() => setOpenAccordion(open ? null : dimId)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
            >
              <span className="text-sm font-medium text-ink">{dim.title}</span>
              <span
                className="shrink-0 text-xs italic"
                style={{ color: chosen ? GROUP_ACCENT[dim.group] : '#8b877e' }}
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
                    onPick(dimId, posId);
                    setOpenAccordion(null);
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
