'use client';

/* eslint-disable react-hooks/immutability --
   three.js objects (mixer, bones, materials) are external mutable state;
   driving them imperatively from effects and the frame loop is the
   react-three-fiber contract. */

// 3D pet: all D1-D4 body encodings live here (materials, shadows, animation,
// attachments). Diagrammatic context layers stay in the SVG overlays.

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { useFrame, useGraph, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, useAnimations, useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Selection } from '@/lib/designSpace';

const MODEL_URL = '/models/dog.glb';
const TARGET_HEIGHT = 1.4; // normalized world height of the dog
const SPAWN_MS = 250;
const WAG_MS = 1200;

useGLTF.preload(MODEL_URL);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export default function PetModel({
  selection,
  generation,
  onWuff,
}: {
  selection: Selection;
  generation: number;
  onWuff: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);

  // Independent skeleton per stage (Builder mounts a desktop and a mobile
  // stage simultaneously; a shared skinned mesh cannot mount twice).
  const model = useMemo(() => {
    const c = cloneSkeleton(scene);
    c.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) mesh.userData.originalMaterial = mesh.material;
    });
    return c;
  }, [scene]);
  const { nodes } = useGraph(model);
  const { actions, names, mixer } = useAnimations(animations, group);

  // Normalize: height 1.4, feet on y=0, centered at x=z=0. Plain
  // Box3.setFromObject measures unskinned geometry (tiny — the armature
  // carries a 100x scale), so compute bone-aware bounds per skinned mesh.
  const fit = useMemo(() => {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const meshBox = new THREE.Box3();
    model.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;
      mesh.skeleton.update();
      mesh.computeBoundingBox();
      meshBox.copy(mesh.boundingBox!).applyMatrix4(mesh.matrixWorld);
      box.union(meshBox);
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    return {
      scale: s,
      position: [-center.x * s, -box.min.y * s, -center.z * s] as [
        number,
        number,
        number,
      ],
    };
  }, [model]);

  const d1 = selection.D1;
  const stylized = selection.D2 === 'D2-P1';
  const realistic = selection.D2 === 'D2-P2';
  const symbolic = selection.D3 === 'D3-P1';
  const behavioral = selection.D3 === 'D3-P3';
  const active = selection.D4 === 'D4-P2';
  const walk = selection.D6 === 'D6-P2';
  const stone = d1 === 'D1-P2';
  const robot = d1 === 'D1-P3';

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  /* ------------------------------------------ materials (D1 x D2) --- */

  const matCache = useRef(new Map<string, THREE.Material>());
  useEffect(() => {
    const cache = matCache.current;
    return () => {
      cache.forEach((m) => m.dispose());
      cache.clear();
    };
  }, []);

  useEffect(() => {
    const cache = matCache.current;
    const materialFor = (orig: THREE.MeshStandardMaterial): THREE.Material => {
      if (!d1 && !stylized) return orig;
      const key = `${d1 ?? 'base'}|${stylized ? 'toon' : 'std'}`;
      const cached = cache.get(key);
      if (cached) return cached;
      let mat: THREE.Material;
      if (d1 === 'D1-P1') {
        // Perceived: teal + translucency is the whole encoding (no glow).
        mat = stylized
          ? new THREE.MeshToonMaterial({ color: '#2f8c78', transparent: true, opacity: 0.55 })
          : new THREE.MeshStandardMaterial({ color: '#2f8c78', transparent: true, opacity: 0.55 });
      } else if (d1 === 'D1-P2') {
        // Material: matte stone.
        mat = stylized
          ? new THREE.MeshToonMaterial({ color: '#a8a094' })
          : new THREE.MeshStandardMaterial({ color: '#a8a094', roughness: 1, metalness: 0 });
      } else if (d1 === 'D1-P3') {
        // Interactive: brushed chrome.
        mat = stylized
          ? new THREE.MeshToonMaterial({ color: '#ccd2d4' })
          : new THREE.MeshStandardMaterial({ color: '#ccd2d4', metalness: 0.4, roughness: 0.3 });
      } else {
        // No D1, stylized: toon-shaded atlas texture.
        mat = new THREE.MeshToonMaterial({ map: orig.map });
      }
      cache.set(key, mat);
      return mat;
    };
    model.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;
      mesh.material = materialFor(
        mesh.userData.originalMaterial as THREE.MeshStandardMaterial,
      );
      mesh.castShadow = realistic;
    });
  }, [model, d1, stylized, realistic]);

  // D2-P1 Stylized: oversized head (mirrors the 2D 1.25 head-scale encoding).
  useEffect(() => {
    const head = nodes.Head as THREE.Bone | undefined;
    head?.scale.setScalar(stylized ? 1.2 : 1);
  }, [nodes, stylized]);

  /* -------------------------------------------------- animation --- */

  // Stone freezes the statue mid-pose; reduced motion stops loops too.
  useEffect(() => {
    mixer.timeScale = stone || reducedMotion ? 0 : 1;
  }, [mixer, stone, reducedMotion]);

  const currentAction = useRef<THREE.AnimationAction | null>(null);
  useEffect(() => {
    const base = walk ? 'Walk' : 'Idle';
    const name = names.find((n) => n === base || n.endsWith(`|${base}`));
    const next = name ? actions[name] : null;
    if (!next || currentAction.current === next) return;
    const prev = currentAction.current;
    if (mixer.timeScale === 0) {
      prev?.stop();
      next.reset().setEffectiveWeight(1).play();
    } else {
      prev?.fadeOut(0.3);
      next.reset().fadeIn(0.3).play();
    }
    currentAction.current = next;
  }, [actions, names, mixer, walk]);

  /* ------------------------------- per-frame: spawn, wag, LED --- */

  const spawnStart = useRef(0);
  useEffect(() => {
    spawnStart.current = performance.now();
  }, [generation]);

  const wagUntil = useRef(0);
  const wasWagging = useRef(false);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    // spawn feedback: scale 0.9 -> 1 over 250ms, ease-out cubic
    const t = Math.min((performance.now() - spawnStart.current) / SPAWN_MS, 1);
    const eased = 1 - (1 - t) ** 3;
    g.scale.setScalar(0.9 + 0.1 * eased);
    // D4-P2 wag: bone-driven tail swing while the wag timer runs
    const tail = nodes.Tail as THREE.Bone | undefined;
    if (tail) {
      const wagging =
        !reducedMotion && active && performance.now() < wagUntil.current;
      if (wagging) {
        tail.rotation.z = Math.sin(clock.elapsedTime * 18) * 0.45;
        wasWagging.current = true;
      } else if (wasWagging.current) {
        wasWagging.current = false;
        tail.rotation.z = 0;
      }
    }
    // D1-P3 LED: square wave 0 <-> 1 every 1s
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = reducedMotion
        ? 1
        : Math.floor(clock.elapsedTime) % 2 === 0
          ? 1
          : 0;
    }
  });

  /* ----------------------------------------------- interaction --- */

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!active) return;
    onWuff();
    wagUntil.current = performance.now() + WAG_MS;
  };

  return (
    <>
      <group
        ref={group}
        rotation-y={-0.6}
        onClick={handleClick}
        onPointerOver={() => {
          if (active) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        <group scale={fit.scale} position={fit.position}>
          <primitive object={model} />
        </group>
        {/* D1-P2 Material: plinth (dog's long axis runs along z) */}
        {stone && (
          <mesh position={[0, 0.06, -0.2]}>
            <boxGeometry args={[1.0, 0.12, 1.4]} />
            <meshStandardMaterial color="#8f887c" />
          </mesh>
        )}
        {/* D1-P3 Interactive: blinking LED above the head */}
        {robot && (
          <mesh position={[0, 1.55, 0.19]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial ref={ledMat} color="#e2574e" emissive="#e2574e" />
          </mesh>
        )}
        {/* D3-P1 Symbolic: collar around the neck base + tag below the chin */}
        {symbolic && (
          <>
            <mesh position={[0, 0.9, 0.1]} rotation-x={1.3}>
              <torusGeometry args={[0.42, 0.055, 12, 32]} />
              <meshStandardMaterial color="#7a3b2e" />
            </mesh>
            <mesh position={[0, 0.66, 0.48]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.09, 0.09, 0.03, 20]} />
              <meshStandardMaterial color="#d9b23c" metalness={0.6} roughness={0.4} />
            </mesh>
          </>
        )}
        {/* D3-P3 Behavioral: tennis ball on the ground ahead of the dog */}
        {behavioral && (
          <mesh position={[0.35, 0.09, 0.95]}>
            <sphereGeometry args={[0.09, 20, 20]} />
            <meshStandardMaterial color="#c9d44a" />
          </mesh>
        )}
      </group>
      {/* D2 shadow encoding: real cast shadow when realistic, soft blob otherwise */}
      {realistic ? (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <shadowMaterial opacity={0.28} />
        </mesh>
      ) : (
        <ContactShadows opacity={0.3} blur={2.4} scale={4} far={1.2} />
      )}
    </>
  );
}
