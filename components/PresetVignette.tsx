'use client';

// Preset vignettes: 3D scene props rendered inside the stage Canvas while
// the current selection exactly matches a workshop preset. World space is
// the normalized stage (dog height 1.4, feet on y=0).

import { useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export default function PresetVignette({ preset }: { preset: string | null }) {
  if (preset === 'Memorial Candle') return <Candle />;
  if (preset === 'Holographic Reliving') return <HoloProjector />;
  if (preset === 'PVP Pet Game') return <ArenaRing />;
  return null;
}

/** Cream candle with a flickering flame — the stage's sole subject. */
function Candle() {
  const reducedMotion = useReducedMotion();
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (flame.current)
      flame.current.scale.y =
        1.6 + 0.18 * Math.sin(t * 9) + 0.09 * Math.sin(t * 23);
    if (light.current)
      light.current.intensity = 0.7 + 0.12 * Math.sin(t * 13);
  });

  return (
    <group position={[0, 0, 0.2]} scale={2}>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.42, 24]} />
        <meshStandardMaterial color="#e9dcc2" roughness={0.9} />
      </mesh>
      <mesh ref={flame} position={[0, 0.47, 0]} scale={[0.7, 1.6, 0.7]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color="#ffd27a"
          emissive="#ff9d2e"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.55, 0]}
        color="#ffb45e"
        intensity={0.7}
        distance={2.2}
      />
    </group>
  );
}

/** Dark projector base with a teal rim and a faint pulsing light cone. */
function HoloProjector() {
  const reducedMotion = useReducedMotion();
  const cone = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (reducedMotion || !cone.current) return;
    cone.current.opacity =
      0.095 + 0.025 * Math.sin(clock.elapsedTime * 1.2);
  });

  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.06, 48]} />
        <meshStandardMaterial color="#3c4a46" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.55, 0.02, 12, 64]} />
        <meshStandardMaterial
          color="#4fd1b5"
          emissive="#4fd1b5"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <coneGeometry args={[1.15, 2.4, 48, 1, true]} />
        <meshBasicMaterial
          ref={cone}
          color="#4fd1b5"
          transparent
          opacity={0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Flat arena rings marking a battle floor. Static. */
function ArenaRing() {
  return (
    <group>
      <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[1.35, 0.035, 12, 96]} />
        <meshStandardMaterial color="#8f6228" transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[1.0, 0.015, 12, 96]} />
        <meshStandardMaterial color="#8f6228" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
