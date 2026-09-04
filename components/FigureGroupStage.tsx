'use client';

// A group panel built from the design space's own icon set: it shows the
// hand-drawn icon (public/icons, one per code) for each of the group's three
// dimensions. Used for Interaction and Afterlife, whose dimensions are abstract
// and are carried by the icons rather than by the 3D pet. The group name lives
// in the StageFrame header above, so the panel carries only the three images —
// two on top, one centered below. Empty (no dim chosen) mirrors PetStage's "?".

import Image from 'next/image';
import {
  DIM_BY_ID,
  getPosition,
  iconFor,
  type DimId,
  type GroupName,
  type Selection,
} from '@/lib/designSpace';
import { StageEmpty } from '@/components/StageFrame';

export default function FigureGroupStage({
  group,
  selection,
}: {
  group: { name: GroupName; accent: string; dims: DimId[] };
  selection: Selection;
}) {
  const empty = group.dims.every((d) => !selection[d]);

  if (empty) {
    return (
      <div className="relative h-full w-full select-none">
        <StageEmpty />
      </div>
    );
  }

  return (
    <div className="grid h-full w-full select-none grid-cols-2 grid-rows-2 gap-1.5 p-1.5">
      {group.dims.map((dimId, i) =>
        i < 2 ? (
          <DimTile
            key={dimId}
            dimId={dimId}
            selection={selection}
            accent={group.accent}
          />
        ) : (
          <div key={dimId} className="col-span-2 flex justify-center">
            <DimTile
              dimId={dimId}
              selection={selection}
              accent={group.accent}
              className="w-1/2"
            />
          </div>
        ),
      )}
    </div>
  );
}

function DimTile({
  dimId,
  selection,
  accent,
  className = '',
}: {
  dimId: DimId;
  selection: Selection;
  accent: string;
  className?: string;
}) {
  const dim = DIM_BY_ID[dimId];
  const posId = selection[dimId];
  const chosen = getPosition(selection, dimId);

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-white ${className}`}
      style={{
        borderColor: posId ? `${accent}40` : 'rgba(37,40,39,0.14)',
        borderStyle: posId ? 'solid' : 'dashed',
      }}
    >
      {posId && chosen ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-2">
          <Image
            src={iconFor(posId)}
            alt={`${dim.title}: ${chosen.label}`}
            width={640}
            height={640}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-serif text-2xl text-ink/25">?</span>
        </div>
      )}
      <div className="px-1.5 pb-1 pt-0.5 text-[10px] leading-tight">
        <span className="font-medium text-ink/70">{dim.title}</span>
        {chosen && (
          <span className="ml-1 italic" style={{ color: accent }}>
            {chosen.label}
          </span>
        )}
      </div>
    </div>
  );
}
