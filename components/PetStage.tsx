'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Selection } from '@/lib/designSpace';
import PetModel from '@/components/PetModel';
import {
  AmbientLayer,
  BackgroundLayer,
  GlyphLayer,
  INK,
  MotesLayer,
  SensoryCues,
  TrailCue,
} from '@/lib/petLayers';

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

  const realistic = selection.D2 === 'D2-P2';

  const onWuff = () => {
    setWuffAt(Date.now());
    clearTimeout(wuffTimer.current);
    wuffTimer.current = window.setTimeout(() => setWuffAt(0), 1200);
  };

  return (
    <div
      className="relative h-full w-full select-none"
      role="img"
      aria-label="Your configured pet"
    >
      {/* back overlay: background (D6) + ambient ring (D5-P3) */}
      <svg
        viewBox="0 0 480 480"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <BackgroundLayer selection={selection} />
        <AmbientLayer selection={selection} />
      </svg>
      {/* 3D pet */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 1.15, 4.8], fov: 38 }}
          shadows
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
          onCreated={({ camera }) => camera.lookAt(0, 1.1, 0)}
        >
          <ambientLight intensity={0.9} />
          <directionalLight
            position={[2.5, 4, 2]}
            intensity={1.3}
            castShadow={realistic}
            shadow-mapSize={[1024, 1024]}
          />
          <Suspense fallback={null}>
            <PetModel
              selection={selection}
              generation={generation}
              onWuff={onWuff}
            />
          </Suspense>
        </Canvas>
      </div>
      {/* front overlay: annotations (D3 cues, D7 motes, D4/D5 glyphs) */}
      <svg
        viewBox="0 0 480 480"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <SensoryCues selection={selection} />
        <TrailCue selection={selection} />
        <MotesLayer selection={selection} />
        <GlyphLayer selection={selection} generation={generation} />
        {/* "wuff" speech bubble (D4-P2, on pet click) */}
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
    </div>
  );
}
