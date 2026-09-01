import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Sphere, Torus, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getPalette } from '../data/palettes.js';
import { getManifestationSpec } from '../lib/manifestationSpec.js';

function ariesHorn(sign) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * 0.55 * sign;
    const y = -1.05 + (x * x) / 0.18;
    pts.push(new THREE.Vector3(x, y - 0.15, 0));
  }
  return pts;
}

function MonadBody({ palette, glow, spec }) {
  const group = useRef();

  useFrame((state, dt) => {
    if (!group.current) return;
    const rate = spec.motion.fieldRate;
    const elapsed = state.clock.elapsedTime;
    group.current.rotation.y += dt * (0.105 + rate * 0.045);

    const px = state.pointer.x;
    const py = state.pointer.y;
    const gaze = spec.field === 'lunar' ? 0.58 : spec.field === 'hypercube' ? 0.38 : 0.45;
    let targetX = py * gaze;
    let targetZ = -px * (0.18 + rate * 0.05);
    let targetScale = 1;

    if (spec.field === 'toroidal' || spec.field === 'spiral') {
      group.current.rotation.y += dt * 0.04 * rate;
      targetZ += Math.sin(elapsed * rate * 0.35) * 0.045;
    } else if (spec.field === 'hypercube') {
      targetX += Math.sin(elapsed * 0.48) * 0.11;
      group.current.rotation.y += dt * 0.055;
      targetScale = 1 + Math.sin(elapsed * 0.7) * 0.018;
    } else if (spec.field === 'solar' || spec.field === 'radiant' || spec.field === 'radial') {
      targetScale = 1 + Math.sin(elapsed * rate * 1.25) * (0.012 + spec.optics.pulse * 0.018);
    } else if (spec.field === 'axial' || spec.field === 'lattice') {
      targetZ *= 0.6;
    } else if (spec.field === 'lunar') {
      targetZ += Math.sin(elapsed * 0.4) * 0.035;
    }

    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 0.05);
    const nextScale = THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.045);
    group.current.scale.setScalar(nextScale);
  });

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
      <Torus args={[1, 0.035, 16, 96]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial emissive={c0} color={c0} emissiveIntensity={glow} toneMapped={false} />
      </Torus>

      <Sphere args={[0.075, 32, 32]}>
        <meshStandardMaterial emissive={c1} color={c1} emissiveIntensity={glow * 1.6} toneMapped={false} />
      </Sphere>

      <Line points={lunaCurve} color={c2} lineWidth={2.5} />
      <Line points={[new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 0.1, 0)]} color={c0} lineWidth={2.5} />
      <Line points={[new THREE.Vector3(-0.5, -0.95, 0), new THREE.Vector3(0.5, -0.95, 0)]} color={c0} lineWidth={2.5} />
      <Line points={ariesHorn(-1)} color={c2} lineWidth={2} />
      <Line points={ariesHorn(1)} color={c2} lineWidth={2} />
    </group>
  );
}

function Aether({ color, count = 120, rate = 1, depth = 0.5 }) {
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

  useFrame((_state, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.035 * rate;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018 + depth * 0.006}
        color={color}
        transparent
        opacity={0.5 + depth * 0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function MonadOrb({ theoremId = 1, stage = 'nigredo', onReady }) {
  const palette = getPalette(theoremId);
  const spec = getManifestationSpec(theoremId);
  const glow = { nigredo: 0.7, albedo: 1.2, rubedo: 2.0 }[stage] ?? 1;
  const c0 = palette[0] || '#ffdf73';
  const bloom = glow * (0.86 + spec.optics.pulse * 0.32);
  const aberration = 0.00045 + spec.optics.chroma * 0.00125;
  const aetherCount = spec.field === 'radiant' ? 150 : spec.field === 'lattice' ? 96 : 120;

  useEffect(() => {
    document.documentElement.style.setProperty('--manifestation-holo-seconds', `${spec.motion.hologramSeconds}s`);
    document.documentElement.style.setProperty('--manifestation-field-rate', String(spec.motion.fieldRate));
    return () => {};
  }, [spec.motion.fieldRate, spec.motion.hologramSeconds]);

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
        <Float
          speed={0.9 + spec.motion.fieldRate * 0.18}
          rotationIntensity={0.1 + spec.optics.chroma * 0.22}
          floatIntensity={0.34 + spec.optics.pulse * 0.28}
        >
          <Sphere args={[1.7, 64, 64]}>
            <MeshTransmissionMaterial
              thickness={0.62 + spec.optics.depth * 0.18}
              roughness={0.045 + (1 - spec.optics.depth) * 0.04}
              transmission={1}
              ior={1.42 + spec.optics.depth * 0.08}
              chromaticAberration={0.22 + spec.optics.chroma * 0.5}
              anisotropy={0.16 + spec.optics.depth * 0.12}
              distortion={0.14 + spec.optics.pulse * 0.12}
              distortionScale={0.3}
              temporalDistortion={0.08 + spec.motion.fieldRate * 0.02}
              backside
              backsideThickness={0.35 + spec.optics.depth * 0.12}
              color="#120a08"
            />
          </Sphere>
          <Aether color={c0} count={aetherCount} rate={spec.motion.fieldRate} depth={spec.optics.depth} />
          <MonadBody palette={palette} glow={glow} spec={spec} />
        </Float>

        <EffectComposer disableNormalPass>
          <Bloom intensity={bloom} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
          <ChromaticAberration offset={[aberration, aberration]} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
