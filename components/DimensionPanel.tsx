'use client';

import {
  GROUP_ACCENT,
  type Dimension,
  type Selection,
} from '@/lib/designSpace';

export default function DimensionPanel({
  dimension,
  selection,
  onPick,
  onClose,
}: {
  dimension: Dimension;
  selection: Selection;
  onPick: (positionId: string) => void;
  onClose?: () => void;
}) {
  const accent = GROUP_ACCENT[dimension.group];
  return (
    <div className="rounded-xl border border-black/10 bg-white shadow-md p-4 text-left">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: accent }}>
            {dimension.group} · {dimension.id}
          </p>
          <h3 className="text-base font-semibold text-ink">{dimension.title}</h3>
          <p className="text-xs text-ink/60">{dimension.question}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 rounded-full w-7 h-7 flex items-center justify-center text-ink/50 hover:text-ink hover:bg-black/5"
          >
            ×
          </button>
        )}
      </div>
      <ul className="mt-2 space-y-2">
        {dimension.positions.map((pos) => {
          const chosen = selection[dimension.id] === pos.id;
          return (
            <li key={pos.id}>
              <button
                onClick={() => onPick(pos.id)}
                aria-pressed={chosen}
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-black/[.03]"
                style={{
                  borderColor: chosen ? accent : 'rgba(0,0,0,0.1)',
                  boxShadow: chosen ? `inset 0 0 0 1px ${accent}` : undefined,
                }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-ink">{pos.label}</span>
                  {chosen && (
                    <span className="text-[11px] font-semibold" style={{ color: accent }}>
                      selected · tap to clear
                    </span>
                  )}
                </span>
                <span className="block text-xs text-ink/70 mt-0.5">{pos.definition}</span>
                <span className="block text-xs text-ink/45 mt-0.5 italic">
                  e.g. {pos.examples.join(', ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
