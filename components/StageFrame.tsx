'use client';

// Shared chrome for one triptych cell: a group-accent header above a square
// framed area that the stage fills. Purely presentational — each stage keeps
// its own empty/partial handling (PetStage already does; the SVG stages use
// <StageEmpty> below for the same bobbing "?" placeholder).

import type { ReactNode } from 'react';

export default function StageFrame({
  label,
  accent,
  ariaLabel,
  children,
}: {
  label: string;
  accent: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div
        role="img"
        aria-label={ariaLabel}
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 bg-white"
      >
        {children}
      </div>
    </div>
  );
}

/** The empty-stage placeholder shared by the SVG stages (mirrors PetStage). */
export function StageEmpty() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="qmark-bob font-serif text-7xl font-semibold text-ink/25">
        ?
      </span>
    </div>
  );
}
