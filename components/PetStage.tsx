'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Selection } from '@/lib/designSpace';
import PetModel from '@/components/PetModel';
import { SensoryCues, TrailCue } from '@/lib/petLayers';

export default function PetStage({
  selection,
  generation,
}: {
  selection: Selection;
  generation: number;
}) {
  const realistic = selection.D2 === 'D2-P2';

  return (
    <div
      className="relative h-full w-full select-none"
      role="img"
      aria-label="Your configured pet"
    >
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
            <PetModel selection={selection} generation={generation} />
          </Suspense>
        </Canvas>
      </div>
      {/* front overlay: D3 annotation cues */}
      <svg
        viewBox="0 0 480 480"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <SensoryCues selection={selection} />
        <TrailCue selection={selection} />
      </svg>
    </div>
  );
}
