'use client';

import { useEffect, useRef, useState } from 'react';
import type { Selection } from '@/lib/designSpace';
import {
  AmbientLayer,
  BackgroundLayer,
  GlyphLayer,
  INK,
  MotesLayer,
  ParticipationLayer,
  PetBody,
  StageDefs,
  TimelineLayer,
} from '@/lib/petLayers';

const PARTICLE_ANGLES = [15, 75, 135, 195, 255, 315];

export default function PetStage({
  selection,
  generation,
}: {
  selection: Selection;
  generation: number;
}) {
  const [wuffAt, setWuffAt] = useState(0);
  const wuffTimer = useRef(0);

  useEffect(
    () => () => {
      clearTimeout(wuffTimer.current);
    },
    [],
  );

  const active = selection.D4 === 'D4-P2';
  const holo = selection.D1 === 'D1-P1';
  const stone = selection.D1 === 'D1-P2';
  const lettingGo = selection.D8 === 'D8-P4';

  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full h-full select-none"
      role="img"
      aria-label="Your configured pet"
    >
      <StageDefs />
      {/* background (D6) */}
      <BackgroundLayer selection={selection} />
      {/* ambient ring (D5-P3) */}
      <AmbientLayer selection={selection} />
      {/* pet group, re-keyed each generation to replay the spawn animation */}
      <g key={generation}>
        <g className="pet-spawn">
          {/* ground contact: plinth for material, shadow otherwise */}
          {stone ? (
            <g>
              <rect x="168" y="396" width="144" height="20" rx="4" fill="#8f887c" stroke={INK} strokeWidth="2" />
              <rect x="176" y="392" width="128" height="8" rx="3" fill="#b8b0a4" stroke={INK} strokeWidth="2" />
            </g>
          ) : (
            <ellipse
              cx="240"
              cy="402"
              rx={holo ? 68 : 80}
              ry="11"
              fill={INK}
              opacity={holo ? 0.18 : 0.1}
            />
          )}
          <g
            className={lettingGo ? 'letting-go' : undefined}
            onClick={() => {
              if (!active) return;
              setWuffAt(Date.now());
              clearTimeout(wuffTimer.current);
              wuffTimer.current = window.setTimeout(() => setWuffAt(0), 1200);
            }}
            style={active ? { cursor: 'pointer' } : undefined}
          >
            <PetBody selection={selection} />
          </g>
        </g>
        {/* spawn particles: 6 circles fading out over 400ms */}
        {generation > 0 && (
          <g className="spawn-particle" fill={INK}>
            {PARTICLE_ANGLES.map((a) => {
              const rad = (a * Math.PI) / 180;
              return (
                <circle
                  key={a}
                  cx={240 + 120 * Math.cos(rad)}
                  cy={290 + 120 * Math.sin(rad)}
                  r="5"
                />
              );
            })}
          </g>
        )}
      </g>
      {/* motes (D7) */}
      <MotesLayer selection={selection} />
      {/* foreground glyphs (D4/D5) */}
      <GlyphLayer selection={selection} generation={generation} />
      {/* timeline strip (D8) */}
      <TimelineLayer selection={selection} />
      {/* participation silhouettes (D9) */}
      <ParticipationLayer selection={selection} />
      {/* "wuff" speech bubble (D4-P2, on click) */}
      {wuffAt > 0 && (
        <g key={wuffAt} className="wuff-bubble">
          <rect x="292" y="112" width="76" height="40" rx="12" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          <path d="M306 150 l-8 14 l20 -12 Z" fill="#ffffff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <text
            x="330"
            y="138"
            textAnchor="middle"
            fontSize="18"
            fontWeight="600"
            fill={INK}
          >
            wuff
          </text>
        </g>
      )}
    </svg>
  );
}
