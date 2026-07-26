'use client';

// Dispatcher for one triptych cell: maps a group to its stage and wraps it in
// the shared StageFrame chrome. Manifestation reuses the 3D PetStage (with its
// preset vignettes); Interaction and Afterlife are built from the thesis
// figure's per-position illustrations (FigureGroupStage).

import type { DimId, GroupName, Selection } from '@/lib/designSpace';
import StageFrame from '@/components/StageFrame';
import PetStage from '@/components/PetStage';
import FigureGroupStage from '@/components/FigureGroupStage';

const ARIA: Record<GroupName, string> = {
  Manifestation: 'How the pet takes form',
  Interaction: 'How you meet and engage with the pet',
  Afterlife: 'Where the pet comes from and how the bond carries on',
};

export default function GroupStage({
  group,
  selection,
  generation,
  preset,
}: {
  group: { name: GroupName; accent: string; description: string; dims: DimId[] };
  selection: Selection;
  generation: number;
  preset: string | null;
}) {
  const content =
    group.name === 'Manifestation' ? (
      <PetStage selection={selection} generation={generation} preset={preset} />
    ) : (
      <FigureGroupStage group={group} selection={selection} />
    );

  return (
    <StageFrame label={group.name} accent={group.accent} ariaLabel={ARIA[group.name]}>
      {content}
    </StageFrame>
  );
}
