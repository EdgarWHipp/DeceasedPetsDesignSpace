'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PRESETS,
  randomSelection,
  type DimId,
} from '@/lib/designSpace';

// Attract mode for convention/kiosk setups. After `idleMs` without any
// pointerdown/keydown, spawns a random full selection every 4 s, cycling one
// preset every 5th spawn. Any interaction exits and re-arms the idle timer.
export default function KioskMode({
  idleMs,
  startActive,
  onSpawn,
}: {
  idleMs: number;
  startActive: boolean;
  onSpawn: (selection: Record<DimId, string>) => void;
}) {
  const [attract, setAttract] = useState(startActive);
  const spawnCount = useRef(0);
  const presetIdx = useRef(0);
  const onSpawnRef = useRef(onSpawn);

  useEffect(() => {
    onSpawnRef.current = onSpawn;
  }, [onSpawn]);

  useEffect(() => {
    let idleTimer = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setAttract(true), idleMs);
    };
    const onInteract = () => {
      setAttract(false);
      arm();
    };
    if (!startActive) arm();
    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [idleMs, startActive]);

  useEffect(() => {
    if (!attract) return;
    const tick = () => {
      spawnCount.current += 1;
      if (spawnCount.current % 5 === 0) {
        onSpawnRef.current(PRESETS[presetIdx.current % PRESETS.length].selection);
        presetIdx.current += 1;
      } else {
        onSpawnRef.current(randomSelection());
      }
    };
    tick();
    const interval = window.setInterval(tick, 4000);
    return () => window.clearInterval(interval);
  }, [attract]);

  if (!attract) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center pb-16">
      <p className="attract-caption rounded-full bg-ink/85 px-8 py-4 text-lg font-medium text-paper shadow-md">
        Touch to build your own pet
      </p>
    </div>
  );
}
