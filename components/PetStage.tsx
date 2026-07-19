'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Selection } from '@/lib/designSpace';
import PetModel from '@/components/PetModel';
import PresetVignette from '@/components/PresetVignette';
import { SensoryCues } from '@/lib/petLayers';

export default function PetStage({
  selection,
  generation,
  preset,
}: {
  selection: Selection;
  generation: number;
  preset: string | null;
}) {
  const realistic = selection.D2 === 'D2-P2';
  const empty = Object.keys(selection).length === 0;

  return (
    <div
      className="relative h-full w-full select-none"
      role="img"
      aria-label={empty ? 'No pet configured yet' : 'Your configured pet'}
    >
      {/* 3D pet (kept mounted; hidden behind the placeholder when empty) */}
      <div
        className={`absolute inset-0 h-full w-full ${empty ? 'invisible' : ''}`}
      >
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
          {/* Memorial Candle: the candle vignette IS the representation */}
          {preset !== 'Memorial Candle' && (
            <Suspense fallback={null}>
              <PetModel selection={selection} generation={generation} />
            </Suspense>
          )}
          <PresetVignette preset={preset} />
        </Canvas>
      </div>
      {/* nothing selected yet: a bobbing question mark holds the stage */}
      {empty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="qmark-bob font-serif text-8xl font-semibold text-ink/25">
            ?
          </span>
        </div>
      )}
      {/* front overlay: D3-P2 sensory cues */}
      <svg
        viewBox="0 0 480 480"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <SensoryCues selection={selection} />
        {preset === 'PVP Pet Game' && (
          <g fontFamily="var(--font-inter), sans-serif">
            {/* your pet: full HP */}
            <rect x="18" y="18" width="150" height="16" rx="8" fill="#ffffff" stroke="#252827" strokeWidth="2" />
            <rect x="21" y="21" width="144" height="10" rx="5" fill="#7fb069" />
            <text x="18" y="52" fontSize="13" fontWeight="700" fill="#252827">
              YOUR PET
            </text>
            {/* wild pet: 60% HP */}
            <rect x="312" y="18" width="150" height="16" rx="8" fill="#ffffff" stroke="#252827" strokeWidth="2" />
            <rect x="315" y="21" width="86" height="10" rx="5" fill="#d97365" />
            <text x="462" y="52" fontSize="13" fontWeight="700" fill="#252827" textAnchor="end">
              WILD PET
            </text>
            <text x="240" y="40" fontSize="20" fontWeight="800" fill="#8f6228" textAnchor="middle" fontStyle="italic">
              VS
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
