'use client';

/* eslint-disable react-hooks/immutability --
   three.js objects (mixer, bones, materials) are external mutable state;
   driving them imperatively from effects and the frame loop is the
   react-three-fiber contract. */

// 3D pet: all D1-D3 body encodings live here (materials, shadows,
// attachments). Diagrammatic context layers stay in the SVG overlays.
// D2-P2 Realistic swaps the voxel dog for a real-proportioned beagle
// ("Beagle" by Poly by Google, CC-BY 3.0), smoothed via realisticGeometry.

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { useFrame, useGraph, useThree } from '@react-three/fiber';
import { ContactShadows, useAnimations, useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Selection } from '@/lib/designSpace';

const MODEL_URL = '/models/dog.glb';
const REAL_MODEL_URL = '/models/dog_realistic.glb';
const TARGET_HEIGHT = 1.4; // normalized world height of the dog
const SPAWN_MS = 250;

useGLTF.preload(MODEL_URL);
useGLTF.preload(REAL_MODEL_URL);

// Prop anchors in normalized stage space (height 1.4, feet on y=0), per
// body model: the voxel dog and the beagle carry their necks differently.
const PROP_ANCHORS = {
  voxel: {
    collar: { pos: [0, 0.8, 0.24], rotX: -1.5, r: 0.44, tube: 0.055 },
    tag: [0, 0.64, 0.62],
    led: [0, 1.55, 0.19],
  },
  real: {
    collar: { pos: [0, 1.03, 0.47], rotX: -0.95, r: 0.17, tube: 0.03 },
    tag: [0, 0.84, 0.62],
    led: [0, 1.52, 0.6],
  },
} as const;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

// D2-P2 Realistic: the source model is voxel art, so realism is earned from
// geometry (built once per mesh, cached). Two rounds of 4:1 subdivision give
// the silhouette enough resolution, position-welded Taubin smoothing rounds
// the voxel steps into an organic form without shrinking it, and
// area-weighted normal averaging across duplicated vertices produces a
// continuous surface. Skinning survives: edge midpoints interpolate weights
// when both parents share a bone set and copy the dominant parent otherwise.

const TAUBIN_LAMBDA = 0.5;
const TAUBIN_MU = -0.53;
// Multigrid schedule: iterations per level, coarse to fine. Smoothing the
// coarse mesh first moves whole voxel corners (one iteration reaches a full
// voxel edge); the fine passes only polish what subdivision introduced.
const SMOOTH_SCHEDULE = [6, 4, 2];

function posKey(pos: THREE.BufferAttribute, i: number): string {
  return `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
}

// 4:1 subdivision. All attributes are read denormalized and emitted as
// Float32 (except skinIndex, which stays integral); midpoints of edges that
// span two bone sets copy the dominant parent instead of interpolating.
function subdivide(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const index = geo.index!;
  const names = Object.keys(geo.attributes);
  const src: Record<string, THREE.BufferAttribute> = {};
  const out: Record<string, number[]> = {};
  for (const name of names) {
    const attr = geo.attributes[name] as THREE.BufferAttribute;
    src[name] = attr;
    const data: number[] = [];
    for (let i = 0; i < attr.count; i++)
      for (let k = 0; k < attr.itemSize; k++) data.push(attr.getComponent(i, k));
    out[name] = data;
  }
  const vertCount = src.position.count;
  const skinned = 'skinIndex' in src && 'skinWeight' in src;
  let nextId = vertCount;
  const midCache = new Map<number, number>();

  const sameBones = (a: number, b: number): boolean => {
    const si = src.skinIndex;
    for (let k = 0; k < si.itemSize; k++)
      if (si.getComponent(a, k) !== si.getComponent(b, k)) return false;
    return true;
  };
  const maxWeight = (v: number): number => {
    const sw = src.skinWeight;
    let m = 0;
    for (let k = 0; k < sw.itemSize; k++) m = Math.max(m, sw.getComponent(v, k));
    return m;
  };

  const midpoint = (a: number, b: number): number => {
    const key = a < b ? a * vertCount + b : b * vertCount + a;
    const hit = midCache.get(key);
    if (hit !== undefined) return hit;
    const rigid = skinned && !sameBones(a, b);
    const donor = rigid && maxWeight(b) > maxWeight(a) ? b : a;
    for (const name of names) {
      const attr = src[name];
      const copyOnly = rigid && (name === 'skinIndex' || name === 'skinWeight');
      for (let k = 0; k < attr.itemSize; k++) {
        out[name].push(
          name === 'skinIndex'
            ? attr.getComponent(rigid ? donor : a, k)
            : copyOnly
              ? attr.getComponent(donor, k)
              : (attr.getComponent(a, k) + attr.getComponent(b, k)) / 2,
        );
      }
    }
    midCache.set(key, nextId);
    return nextId++;
  };

  const newIndex: number[] = [];
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t);
    const b = index.getX(t + 1);
    const c = index.getX(t + 2);
    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const ca = midpoint(c, a);
    newIndex.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }

  const result = new THREE.BufferGeometry();
  for (const name of names) {
    const attr = src[name];
    result.setAttribute(
      name,
      new THREE.BufferAttribute(
        name === 'skinIndex'
          ? new Uint16Array(out[name])
          : new Float32Array(out[name]),
        attr.itemSize,
      ),
    );
  }
  result.setIndex(newIndex);
  return result;
}

// Taubin lambda|mu smoothing over position-welded vertices: duplicated
// corners move together, so hard-edge splits never tear open.
function taubinSmooth(geo: THREE.BufferGeometry, iterations: number): void {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const index = geo.index!;
  const canonical = new Map<string, number>();
  const slotOf = new Int32Array(pos.count);
  const members: number[][] = [];
  for (let i = 0; i < pos.count; i++) {
    const k = posKey(pos, i);
    let slot = canonical.get(k);
    if (slot === undefined) {
      slot = members.length;
      canonical.set(k, slot);
      members.push([]);
    }
    members[slot].push(i);
    slotOf[i] = slot;
  }
  const neighbors: Set<number>[] = members.map(() => new Set<number>());
  for (let t = 0; t < index.count; t += 3) {
    const a = slotOf[index.getX(t)];
    const b = slotOf[index.getX(t + 1)];
    const c = slotOf[index.getX(t + 2)];
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }
  const n = members.length;
  let cur = new Float64Array(n * 3);
  let next = new Float64Array(n * 3);
  for (let s = 0; s < n; s++) {
    const i = members[s][0];
    cur[s * 3] = pos.getX(i);
    cur[s * 3 + 1] = pos.getY(i);
    cur[s * 3 + 2] = pos.getZ(i);
  }
  const pass = (factor: number) => {
    for (let s = 0; s < n; s++) {
      const nb = neighbors[s];
      const x = cur[s * 3];
      const y = cur[s * 3 + 1];
      const z = cur[s * 3 + 2];
      if (nb.size === 0) {
        next[s * 3] = x;
        next[s * 3 + 1] = y;
        next[s * 3 + 2] = z;
        continue;
      }
      let ax = 0;
      let ay = 0;
      let az = 0;
      for (const o of nb) {
        ax += cur[o * 3];
        ay += cur[o * 3 + 1];
        az += cur[o * 3 + 2];
      }
      ax /= nb.size;
      ay /= nb.size;
      az /= nb.size;
      next[s * 3] = x + factor * (ax - x);
      next[s * 3 + 1] = y + factor * (ay - y);
      next[s * 3 + 2] = z + factor * (az - z);
    }
    [cur, next] = [next, cur];
  };
  for (let it = 0; it < iterations; it++) {
    pass(TAUBIN_LAMBDA);
    pass(TAUBIN_MU);
  }
  for (let s = 0; s < n; s++)
    for (const i of members[s])
      pos.setXYZ(i, cur[s * 3], cur[s * 3 + 1], cur[s * 3 + 2]);
  pos.needsUpdate = true;
}

// Average area-weighted face normals across position-welded vertices (the
// mesh splits verts at every hard edge, so computeVertexNormals() alone
// cannot smooth the silhouette).
function smoothNormals(geo: THREE.BufferGeometry): void {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const idx = geo.index!;
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
      const k = posKey(pos, i);
      const v = acc.get(k);
      if (v) v.add(n);
      else acc.set(k, n.clone());
    }
  }
  const normal = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    n.copy(acc.get(posKey(pos, i))!).normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  normal.needsUpdate = true;
}

function realisticGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  let geo = src.clone();
  taubinSmooth(geo, SMOOTH_SCHEDULE[0]);
  for (const iters of SMOOTH_SCHEDULE.slice(1)) {
    geo = subdivide(geo);
    taubinSmooth(geo, iters);
  }
  smoothNormals(geo);
  return geo;
}

export default function PetModel({
  selection,
  generation,
}: {
  selection: Selection;
  generation: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { scene: realScene } = useGLTF(REAL_MODEL_URL);

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

  // D2-P2 body: static beagle, subdivided + smoothed once per instance.
  const realModel = useMemo(() => {
    const c = realScene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.userData.originalMaterial = mesh.material;
      mesh.geometry = realisticGeometry(mesh.geometry);
      mesh.castShadow = true;
    });
    return c;
  }, [realScene]);

  useEffect(
    () => () => {
      realModel.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
    },
    [realModel],
  );

  const realFit = useMemo(() => {
    realModel.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(realModel);
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
  }, [realModel]);
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
    });
    realModel.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = materialFor(
        mesh.userData.originalMaterial as THREE.MeshStandardMaterial,
      );
    });
  }, [model, realModel, d1, stylized, realistic]);

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
    const name = names.find((n) => n === 'Idle' || n.endsWith('|Idle'));
    const next = name ? actions[name] : null;
    if (!next || currentAction.current === next) return;
    next.reset().setEffectiveWeight(1).play();
    currentAction.current = next;
  }, [actions, names]);

  /* ------------------------------------ per-frame: spawn, LED --- */

  const spawnStart = useRef(0);
  useEffect(() => {
    spawnStart.current = performance.now();
  }, [generation]);

  const ledMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    // spawn feedback: scale 0.9 -> 1 over 250ms, ease-out cubic
    const t = Math.min((performance.now() - spawnStart.current) / SPAWN_MS, 1);
    const eased = 1 - (1 - t) ** 3;
    g.scale.setScalar(0.9 + 0.1 * eased);
    // D1-P3 LED: square wave 0 <-> 1 every 1s
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = reducedMotion
        ? 1
        : Math.floor(clock.elapsedTime) % 2 === 0
          ? 1
          : 0;
    }
  });

  const anchors = realistic ? PROP_ANCHORS.real : PROP_ANCHORS.voxel;

  return (
    <>
      <group ref={group} rotation-y={-0.6}>
        {realistic ? (
          <group scale={realFit.scale} position={realFit.position}>
            <primitive object={realModel} />
          </group>
        ) : (
          <group scale={fit.scale} position={fit.position}>
            <primitive object={model} />
          </group>
        )}
        {/* D1-P2 Material: plinth (dog's long axis runs along z) */}
        {stone && (
          <mesh position={[0, 0.06, -0.2]}>
            <boxGeometry args={[1.0, 0.12, 1.4]} />
            <meshStandardMaterial color="#8f887c" />
          </mesh>
        )}
        {/* D1-P3 Interactive: blinking LED above the head */}
        {robot && (
          <mesh position={anchors.led as unknown as THREE.Vector3Tuple}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial ref={ledMat} color="#e2574e" emissive="#e2574e" />
          </mesh>
        )}
        {/* D3-P1 Symbolic: collar around the neck base + tag below the chin */}
        {symbolic && (
          <>
            <mesh
              position={anchors.collar.pos as unknown as THREE.Vector3Tuple}
              rotation-x={anchors.collar.rotX}
            >
              <torusGeometry args={[anchors.collar.r, anchors.collar.tube, 12, 32]} />
              <meshStandardMaterial color="#7a3b2e" />
            </mesh>
            <mesh
              position={anchors.tag as unknown as THREE.Vector3Tuple}
              rotation-x={Math.PI / 2}
            >
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
