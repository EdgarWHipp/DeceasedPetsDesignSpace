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

// D3-P2 Sensory: scent wisps + sound arcs beside the head (kept clear of the
// pet's face region).
export function SensoryCues({ selection }: { selection: Selection }) {
  if (selection.D3 !== 'D3-P2') return null;
  return (
    <g fill="none" stroke={MANIFESTATION} strokeWidth="2.5" strokeLinecap="round" opacity="0.75">
      <path d="M308 218 q10 -8 4 -18 q-6 -9 2 -17" />
      <path d="M322 226 q10 -8 4 -18 q-6 -9 2 -17" />
      <path d="M336 234 q10 -8 4 -18 q-6 -9 2 -17" />
      <path d="M304 148 a20 20 0 0 1 6 26" />
      <path d="M314 138 a30 30 0 0 1 9 40" />
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
    // Context-Bound: room corner, window, pet bed
    return (
      <g>
        <line x1="90" y1="120" x2="90" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="28" y1="400" x2="452" y2="400" stroke="#d8d2c4" strokeWidth="4" />
        <rect x="330" y="82" width="92" height="112" rx="4" fill="#efece4" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="376" y1="82" x2="376" y2="194" stroke="#d8d2c4" strokeWidth="3" />
        <line x1="330" y1="138" x2="422" y2="138" stroke="#d8d2c4" strokeWidth="3" />
        <ellipse cx="240" cy="396" rx="115" ry="22" fill="#e6dfd0" stroke="#d8d2c4" strokeWidth="3" />
      </g>
    );
  }
  if (d6 === 'D6-P2') {
    // Unrestricted: horizon + drifting clouds + path dots
    return (
      <g>
        <line x1="0" y1="400" x2="480" y2="400" stroke="#d8d2c4" strokeWidth="3" />
        <g className="cloud-drift" fill="#ffffff" opacity="0.85">
          <ellipse cx="60" cy="92" rx="34" ry="14" />
          <ellipse cx="86" cy="84" rx="24" ry="12" />
        </g>
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
      strokeWidth="8"
    />
  );
}

/* ------------------------------------------------------- D7 motes --- */

export function MotesLayer({ selection }: { selection: Selection }) {
  const d7 = selection.D7;
  if (!d7) return null;
  const personal = d7 === 'D7-P1';
  const angles = [0, 72, 144, 216, 288];
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
      <g key="brackets" fill="none" stroke={INTERACTION} strokeWidth="3" opacity="0.8">
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

/* ------------------------------------------------------ D8 timeline --- */

export function TimelineLayer({ selection }: { selection: Selection }) {
  const d8 = selection.D8;
  if (!d8) return null;
  const xs = [168, 216, 264, 312];
  const y = 446;
  const cut = d8 === 'D8-P4';
  return (
    <g>
      <line
        x1={xs[0]}
        y1={y}
        x2={cut ? xs[1] : xs[3]}
        y2={y}
        stroke={AFTERLIFE}
        strokeWidth="3"
      />
      {xs.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="6"
          fill={AFTERLIFE}
          opacity={cut && i > 1 ? 0.25 : 1}
        />
      ))}
      {d8 === 'D8-P1' && (
        // arrow curving back to dot 1
        <g fill="none" stroke={AFTERLIFE} strokeWidth="2.5">
          <path d="M312 438 Q240 412 174 436" />
          <path d="M182 428 L174 436 L185 439" fill="none" />
        </g>
      )}
      {d8 === 'D8-P2' && (
        // loop arcs across all dots
        <g fill="none" stroke={AFTERLIFE} strokeWidth="2.5">
          <path d="M168 440 q24 -20 48 0" />
          <path d="M216 440 q24 -20 48 0" />
          <path d="M264 440 q24 -20 48 0" />
        </g>
      )}
      {d8 === 'D8-P3' && (
        // arrow to a hollow extra dot
        <g stroke={AFTERLIFE} strokeWidth="2.5" fill="none">
          <line x1="312" y1={y} x2="348" y2={y} />
          <path d="M341 440 L349 446 L341 452" />
          <circle cx="360" cy={y} r="6" fill="#f7f5f0" />
        </g>
      )}
    </g>
  );
}

/* ------------------------------------------- D9 participation circle --- */

function Person({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK} opacity="0.55">
      <circle cx="0" cy="-15" r="6" />
      <path d="M-8 12 Q-8 -6 0 -6 Q8 -6 8 12 Z" />
    </g>
  );
}

export function ParticipationLayer({ selection }: { selection: Selection }) {
  const d9 = selection.D9;
  if (d9 === 'D9-P1') {
    return <Person x={418} y={430} />;
  }
  if (d9 === 'D9-P2') {
    return (
      <g>
        <Person x={396} y={432} s={0.85} />
        <Person x={419} y={428} />
        <Person x={441} y={433} s={0.85} />
      </g>
    );
  }
  if (d9 === 'D9-P3') {
    // arc of 12 crowd dots along the lower stage rim
    const dots = Array.from({ length: 12 }, (_, i) => {
      const t = ((18 + i * 12) * Math.PI) / 180; // 18°..150°
      return [240 + 215 * Math.cos(t), 300 + 152 * Math.sin(t)];
    });
    return (
      <g fill={INK} opacity="0.45">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" />
        ))}
      </g>
    );
  }
  return null;
}
