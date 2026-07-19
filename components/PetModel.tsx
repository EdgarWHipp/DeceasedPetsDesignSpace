'use client';

/* eslint-disable react-hooks/immutability --
   three.js objects (mixer, bones, materials) are external mutable state;
   driving them imperatively from effects and the frame loop is the
   react-three-fiber contract. */

// 3D pet: all D1-D4 body encodings live here (materials, shadows, animation,
// attachments). Diagrammatic context layers stay in the SVG overlays.

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { useFrame, useGraph, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, useAnimations, useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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

// D4-P2 head tracking: reusable scratch objects (set + consumed within one
// frame callback, so sharing across stage instances is safe).
const HEAD_Q = new THREE.Quaternion();
const HEAD_E = new THREE.Euler();

// D2-P2 Realistic: average area-weighted face normals across duplicated
// vertices (the GLB splits verts at every hard edge, so
// computeVertexNormals() alone cannot smooth the silhouette).
function smoothedGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = src.clone();
  const pos = geo.attributes.position;
  const idx = geo.index!;
  const key = (i: number) =>
    `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  const acc = new Map<string, THREE.Vector3>();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    const ia = idx.getX(t);
    const ib = idx.getX(t + 1);
    const ic = idx.getX(t + 2);
    a.fromBufferAttribute(pos, ia);
    b.fromBufferAttribute(pos, ib);
    c.fromBufferAttribute(pos, ic);
    n.copy(b).sub(a).cross(c.sub(a)); // unnormalized = area-weighted
    for (const i of [ia, ib, ic]) {
      const k = key(i);
      const v = acc.get(k);
      if (v) v.add(n);
      else acc.set(k, n.clone());
    }
  }
  const normal = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    n.copy(acc.get(key(i))!).normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  normal.needsUpdate = true;
  return geo;
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
      if (mesh.isSkinnedMesh) {
        mesh.userData.originalMaterial = mesh.material;
        mesh.userData.originalGeometry = mesh.geometry;
      }
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
      model.traverse((obj) => {
        const smooth = (obj as THREE.SkinnedMesh).userData.smoothGeometry as
          | THREE.BufferGeometry
          | undefined;
        smooth?.dispose();
      });
    };
  }, [model]);

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
      mesh.geometry = realistic
        ? ((mesh.userData.smoothGeometry as THREE.BufferGeometry | undefined) ??
          (mesh.userData.smoothGeometry = smoothedGeometry(
            mesh.userData.originalGeometry as THREE.BufferGeometry,
          )))
        : (mesh.userData.originalGeometry as THREE.BufferGeometry);
      mesh.castShadow = realistic;
    });
  }, [model, d1, stylized, realistic]);

  // D2-P2 Realistic: image-based lighting grounds the standard materials.
  // MeshToonMaterial ignores scene.environment, so stylized is untouched.
  const { gl, scene: rootScene } = useThree();
  useEffect(() => {
    if (!realistic) return;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment()).texture;
    rootScene.environment = env;
    rootScene.environmentIntensity = 0.5;
    return () => {
      rootScene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [realistic, gl, rootScene]);

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
  const headOffset = useRef(new THREE.Vector2());
  const headBase = useRef(new THREE.Quaternion());
  const headLast = useRef(new THREE.Quaternion());
  const wasTracking = useRef(false);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock, pointer }) => {
    const g = group.current;
    if (!g) return;
    // spawn feedback: scale 0.9 -> 1 over 250ms, ease-out cubic
    const t = Math.min((performance.now() - spawnStart.current) / SPAWN_MS, 1);
    const eased = 1 - (1 - t) ** 3;
    g.scale.setScalar(0.9 + 0.1 * eased);
    const animating = mixer.timeScale > 0;
    // D4-P2 wag: gentle idle swing whenever Active; fast burst on click
    const tail = nodes.Tail as THREE.Bone | undefined;
    if (tail) {
      if (active && animating) {
        tail.rotation.z =
          performance.now() < wagUntil.current
            ? Math.sin(clock.elapsedTime * 18) * 0.45
            : Math.sin(clock.elapsedTime * 6) * 0.18;
        wasWagging.current = true;
      } else if (wasWagging.current) {
        wasWagging.current = false;
        tail.rotation.z = 0;
      }
    }
    // D4-P2 head tracking: compose (mixer pose x damped pointer offset) on
    // the Head bone. The mixer's PropertyMixer only rewrites the quaternion
    // when the track value changes between frames, so a bare post-multiply
    // would accumulate during constant idle segments. Detect whether the
    // mixer wrote this frame (quaternion differs from our last composite)
    // and re-capture its pose as the base; on disengage restore it once.
    const head = nodes.Head as THREE.Bone | undefined;
    if (head) {
      if (active && animating) {
        if (!wasTracking.current || !head.quaternion.equals(headLast.current)) {
          headBase.current.copy(head.quaternion);
        }
        headOffset.current.lerp(pointer, 0.12);
        // Head bone axes (GLB rest pose): local Z = world up (yaw),
        // local X = world -X (pitch). Signs verified visually.
        HEAD_Q.setFromEuler(
          HEAD_E.set(headOffset.current.y * 0.15, 0, headOffset.current.x * 0.3),
        );
        head.quaternion.copy(headBase.current).multiply(HEAD_Q);
        headLast.current.copy(head.quaternion);
        wasTracking.current = true;
      } else if (wasTracking.current) {
        wasTracking.current = false;
        head.quaternion.copy(headBase.current);
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
