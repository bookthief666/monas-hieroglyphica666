import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Sphere, Torus, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getPalette } from '../data/palettes.js';

/*
 * ============================================================================
 * THE HIEROGLYPHIC MONAD AS A 3D BODY
 * ----------------------------------------------------------------------------
 * Dee's glyph is not flat — it is the compression of an entire cosmology.
 * Here we re-expand it into space so the operator can orbit the cosmos itself.
 * Each member is the geometric body of a specific theorem:
 *
 *   SOL     — a torus: the solar circle "having a visible centre" (Theorema III)
 *   PUNCTUM — a tiny emissive sphere at the origin: Earth / the central point (II)
 *   LUNA    — a swept crescent arc above Sol, "acknowledging the Sun" (Theorema IV)
 *   CRUX    — two orthogonal bars: the Ternary × Quaternary elemental cross (VI)
 *   ARIES   — twin parabolic horns "capturing the solar emanations" (Theorema XII)
 *
 * The whole assembly is enclosed in a glass/obsidian sphere — Dee's shew-stone —
 * so the operator looks THROUGH matter into the formal cause. Bloom and the
 * inner light scale with the alchemical `stage`, so the orb literally darkens
 * (Nigredo), purifies (Albedo), and blazes (Rubedo) across the 24 theorems.
 * ============================================================================
 */

// Aries' twin horns: a small parabola opening upward, mirrored left/right.
function ariesHorn(sign) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * 0.55 * sign;
    const y = -1.05 + (x * x) / 0.18; // parabola — the reflector that gathers pneuma
    pts.push(new THREE.Vector3(x, y - 0.15, 0));
  }
  return pts;
}

function MonadBody({ palette, glow }) {
  const group = useRef();

  useFrame((state, dt) => {
    if (!group.current) return;
    // base hermetic rotation: the slow precession of the celestial vault
    group.current.rotation.y += dt * 0.16;
    // the "sympathetic magical link": the Monad tilts toward the operator's gaze,
    // damped by lerp so it attends to the cursor rather than snapping at it.
    const px = state.pointer.x;
    const py = state.pointer.y;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, py * 0.45, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -px * 0.25, 0.05);
  });

  // LUNA — a partial sweep (a crescent, not a full ring) resting above Sol.
  const lunaCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const a = Math.PI * (0.12 + (i / 48) * 0.76);
      pts.push(new THREE.Vector3(Math.cos(a) * 0.62, 1.02 + Math.sin(a) * 0.42, 0));
    }
    return pts;
  }, []);

  const c0 = palette[0] || '#ffdf73';
  const c1 = palette[1] || '#ffffff';
  const c2 = palette[2] || c0;

  return (
    <group ref={group}>
      {/* SOL — the solar circle with a visible centre */}
      <Torus args={[1, 0.035, 16, 96]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial emissive={c0} color={c0} emissiveIntensity={glow} toneMapped={false} />
      </Torus>

      {/* PUNCTUM — the central point / Earth, brightest of all */}
      <Sphere args={[0.075, 32, 32]}>
        <meshStandardMaterial emissive={c1} color={c1} emissiveIntensity={glow * 1.6} toneMapped={false} />
      </Sphere>

      {/* LUNA — the crescent that acknowledges Sol as her lord */}
      <Line points={lunaCurve} color={c2} lineWidth={2.5} />

      {/* CRUX — the Ternary × Quaternary elemental cross */}
      <Line points={[new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 0.1, 0)]} color={c0} lineWidth={2.5} />
      <Line points={[new THREE.Vector3(-0.5, -0.95, 0), new THREE.Vector3(0.5, -0.95, 0)]} color={c0} lineWidth={2.5} />

      {/* ARIES — twin horns capturing the solar pneuma */}
      <Line points={ariesHorn(-1)} color={c2} lineWidth={2} />
      <Line points={ariesHorn(1)} color={c2} lineWidth={2} />
    </group>
  );
}

// Inner motes of "aether" drifting inside the glass.
function Aether({ color, count = 120 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.4 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function MonadOrb({ theoremId = 1, stage = 'nigredo', onReady }) {
  const palette = getPalette(theoremId);
  const glow = { nigredo: 0.7, albedo: 1.2, rubedo: 2.0 }[stage] ?? 1;
  const c0 = palette[0] || '#ffdf73';

  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', () => { throw new Error('WebGL context lost'); });
        if (onReady) onReady();
      }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 3]} intensity={glow * 2} color={c0} />
      <pointLight position={[2, 2, -2]} intensity={glow} color={palette[2] || c0} />

      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.45}>
          {/* the obsidian scrying glass — look THROUGH matter to the form within */}
          <Sphere args={[1.7, 64, 64]}>
            <MeshTransmissionMaterial
              thickness={0.7}
              roughness={0.06}
              transmission={1}
              ior={1.45}
              chromaticAberration={0.35}
              anisotropy={0.2}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.1}
              backside
              backsideThickness={0.4}
              color="#120a08"
            />
          </Sphere>
          <Aether color={c0} />
          <MonadBody palette={palette} glow={glow} />
        </Float>

        <EffectComposer disableNormalPass>
          <Bloom intensity={glow} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
          <ChromaticAberration offset={[0.0007 * glow, 0.0007 * glow]} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
