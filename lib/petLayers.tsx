// Per-position SVG overlay layers for the pet stage. The pet body itself is
// 3D (components/PetModel.tsx); these layers are the diagrammatic annotations
// composed around it. Stage viewBox is 0 0 480 480, ground y=400.

import type { ReactNode } from 'react';
import type { Selection } from './designSpace';

export const INK = '#252827';
export const NEUTRAL = '#c9c3b8';
const MANIFESTATION = '#2f8c78';
const INTERACTION = '#b18452';
const AFTERLIFE = '#8a7ca8';

/* --------------------------------------- D3 annotation cues (front) --- */

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

// D3-P3 Behavioral: dashed motion trail (the ball itself is 3D).
export function TrailCue({ selection }: { selection: Selection }) {
  if (selection.D3 !== 'D3-P3') return null;
  return (
    <path
      d="M336 344 q42 8 68 -20"
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeDasharray="7 7"
      strokeLinecap="round"
      opacity="0.6"
    />
  );
}

/* ---------------------------------------------------- D6 background --- */

export function BackgroundLayer({ selection }: { selection: Selection }) {
  const d6 = selection.D6;
  if (d6 === 'D6-P1') {
    // Context-Bound: ground line + pet bed mark its one place
    return (
      <g>
        <line x1="60" y1="400" x2="420" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        <ellipse cx="240" cy="396" rx="115" ry="22" fill="#e6dfd0" stroke="#d8d2c4" strokeWidth="3" />
      </g>
    );
  }
  if (d6 === 'D6-P2') {
    // Unrestricted: open horizon + path dots trailing off
    return (
      <g>
        <line x1="0" y1="400" x2="480" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        {[152, 180, 208, 272, 300, 328].map((x) => (
          <circle key={x} cx={x} cy="410" r="3" fill={INK} opacity="0.25" />
        ))}
      </g>
    );
  }
  return null;
}

/* --------------------------------- D5-P3 ambient ring (behind the pet) --- */

export function AmbientLayer({ selection }: { selection: Selection }) {
  if (selection.D5 !== 'D5-P3') return null;
  return (
    <circle
      className="ring-breathe"
      cx="240"
      cy="295"
      r="155"
      fill="none"
      stroke={INTERACTION}
      strokeWidth="4"
      opacity="0.6"
    />
  );
}

/* ------------------------------------------------------- D7 motes --- */

export function MotesLayer({ selection }: { selection: Selection }) {
  const d7 = selection.D7;
  if (!d7) return null;
  const personal = d7 === 'D7-P1';
  const angles = [90, 210, 330];
  return (
    <g className="mote-orbit">
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 240 + 150 * Math.cos(rad);
        const y = 290 + 150 * Math.sin(rad);
        if (personal) {
          // tiny photo frames and hearts
          return i % 2 === 0 ? (
            <g key={a} transform={`translate(${x - 8} ${y - 6})`}>
              <rect width="16" height="12" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
              <rect x="2.5" y="2.5" width="11" height="7" fill={AFTERLIFE} opacity="0.7" />
            </g>
          ) : (
            <path
              key={a}
              transform={`translate(${x} ${y - 5})`}
              d="M0 3 C-1 0 -6 0 -6 4 C-6 8 0 11 0 11 C0 11 6 8 6 4 C6 0 1 0 0 3"
              fill={AFTERLIFE}
              opacity="0.85"
            />
          );
        }
        // recorded data: tiny squares and waveform ticks
        return i % 2 === 0 ? (
          <rect
            key={a}
            x={x - 5}
            y={y - 5}
            width="10"
            height="10"
            fill="none"
            stroke={AFTERLIFE}
            strokeWidth="2"
          />
        ) : (
          <g key={a} stroke={AFTERLIFE} strokeWidth="2" strokeLinecap="round">
            <line x1={x - 5} y1={y - 3} x2={x - 5} y2={y + 3} />
            <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
            <line x1={x + 5} y1={y - 4} x2={x + 5} y2={y + 4} />
          </g>
        );
      })}
    </g>
  );
}

/* --------------------------------------- D4/D5 foreground glyphs --- */

export function GlyphLayer({
  selection,
  generation,
}: {
  selection: Selection;
  generation: number;
}) {
  const nodes: ReactNode[] = [];
  if (selection.D4 === 'D4-P1') {
    // Passive: thin frame corner brackets at the 4 stage corners
    nodes.push(
      <g key="brackets" fill="none" stroke={INTERACTION} strokeWidth="2.5" opacity="0.6">
        <path d="M16 44 V16 H44" />
        <path d="M436 16 H464 V44" />
        <path d="M464 436 V464 H436" />
        <path d="M44 464 H16 V436" />
      </g>,
    );
  }
  if (selection.D5 === 'D5-P1') {
    // User Initiated: summon-button glyph bottom-left + ripple on spawn
    nodes.push(
      <g key="summon">
        <rect x="20" y="420" width="46" height="32" rx="9" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <path d="M38 428 l14 8 l-14 8 Z" fill={INTERACTION} />
        <circle
          key={`ripple-${generation}`}
          className="spawn-ripple"
          cx="240"
          cy="360"
          r="46"
          fill="none"
          stroke={INTERACTION}
          strokeWidth="3"
        />
      </g>,
    );
  }
  if (selection.D5 === 'D5-P2') {
    // Externally Initiated: clock glyph top-left + expanding pulse on spawn
    nodes.push(
      <g key="clock">
        <circle cx="46" cy="46" r="19" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <line x1="46" y1="46" x2="46" y2="34" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="46" y1="46" x2="55" y2="50" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle
          key={`pulse-${generation}`}
          className="spawn-ripple"
          cx="46"
          cy="46"
          r="24"
          fill="none"
          stroke={INTERACTION}
          strokeWidth="3"
        />
      </g>,
    );
  }
  return <>{nodes}</>;
}
