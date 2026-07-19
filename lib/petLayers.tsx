// Per-position SVG overlay layers for the pet stage. The pet body itself is
// 3D (components/PetModel.tsx); these layers are the diagrammatic annotations
// composed around it. Only Manifestation dimensions render on the stage;
// Interaction and Afterlife are select-only. Stage viewBox is 0 0 480 480.

import type { Selection } from './designSpace';

const MANIFESTATION = '#2f8c78';

/* --------------------------------------- D3 annotation cue (front) --- */

// D3-P2 Sensory: one scent wisp + one sound arc beside the head (kept clear
// of the pet's face region).
export function SensoryCues({ selection }: { selection: Selection }) {
  if (selection.D3 !== 'D3-P2') return null;
  return (
    <g fill="none" stroke={MANIFESTATION} strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
      <path d="M318 224 q10 -8 4 -18 q-6 -9 2 -17" />
      <path d="M310 142 a26 26 0 0 1 8 34" />
    </g>
  );
}
