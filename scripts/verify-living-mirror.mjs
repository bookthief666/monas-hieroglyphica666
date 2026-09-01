import assert from 'node:assert/strict';
import { getManifestationSpec, manifestationFields } from '../src/lib/manifestationSpec.js';
import { targetForParticle } from '../src/lib/particleGeometry.js';
import {
  buildSkeletonSegments,
  particleRole,
  roleTarget,
  singularityAnchors,
} from '../src/lib/mirrorGeometry.js';
import { readMirrorMemory } from '../src/lib/mirrorMemory.js';

const SHAPES = [
  'line-circle',
  'point-line-circle',
  'sun-earth',
  'sun-moon',
  'cross-rotated',
  'cross-quaternary',
  'triangle-fire',
  'square-circle',
  'aries-cross',
  'metatron',
  'icosahedron',
  'torus',
  'sri-yantra',
  'pentagram',
  'sacred-252',
  'monad-full',
  'hermetic-egg',
  'sephiroth',
  'albedo-rubedo',
  'radiance',
  'hypercube-stone',
  'infinite-spiral',
];

function finiteObject(obj, path = 'value') {
  for (const [key, value] of Object.entries(obj)) {
    const next = `${path}.${key}`;
    if (typeof value === 'number') assert.ok(Number.isFinite(value), `${next} must be finite`);
    else if (value && typeof value === 'object') finiteObject(value, next);
  }
}

for (let theoremId = 1; theoremId <= 24; theoremId += 1) {
  const spec = getManifestationSpec(theoremId);
  assert.equal(spec.theoremId, theoremId);
  assert.ok(manifestationFields.includes(spec.field), `Theorem ${theoremId} has an unknown field`);
  finiteObject(spec, `theorem[${theoremId}]`);
  assert.ok(spec.physics.radius > 0);
  assert.ok(spec.physics.spring > 0);
  assert.ok(spec.physics.damping > 0 && spec.physics.damping < 1);
  assert.ok(spec.optics.depth >= 0 && spec.optics.depth <= 1, `Theorem ${theoremId} depth out of range`);
  assert.ok(spec.optics.skeleton >= 0 && spec.optics.skeleton <= 1, `Theorem ${theoremId} skeleton out of range`);
  assert.equal(typeof spec.operative.mode, 'string');
  assert.ok(spec.operative.mode.length > 0);
  assert.ok(spec.operative.holdMs >= 200 && spec.operative.holdMs <= 1000);
  assert.ok(spec.operative.chargeMs >= 400 && spec.operative.chargeMs <= 2000);
}

let sampledTargets = 0;
let sampledSkeletonPoints = 0;
for (const shape of SHAPES) {
  const theoremId = (SHAPES.indexOf(shape) % 24) + 1;
  for (let i = 0; i < 320; i += 1) {
    const point = targetForParticle(shape, i, 320, 140, 140, 78, theoremId);
    assert.ok(Number.isFinite(point.x), `${shape}[${i}].x is not finite`);
    assert.ok(Number.isFinite(point.y), `${shape}[${i}].y is not finite`);
    assert.ok(Math.abs(point.x) < 1000 && Math.abs(point.y) < 1000, `${shape}[${i}] escaped the mirror`);
    sampledTargets += 1;
  }

  const skeleton = buildSkeletonSegments(shape, 140, 140, 78, theoremId, 224);
  assert.ok(skeleton.length > 0, `${shape} produced no skeleton segments`);
  for (const segment of skeleton) {
    assert.ok(segment.length > 1, `${shape} produced a one-point skeleton segment`);
    for (const point of segment) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), `${shape} skeleton contains a non-finite point`);
      sampledSkeletonPoints += 1;
    }
  }

  const anchors = singularityAnchors(shape, 140, 140, 78);
  assert.ok(anchors.length > 0, `${shape} produced no singularity anchors`);
  anchors.forEach((point, index) => {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), `${shape} anchor ${index} is not finite`);
  });

  const roles = new Set();
  for (let i = 0; i < 320; i += 1) {
    const role = particleRole(i, theoremId);
    roles.add(role);
    const base = targetForParticle(shape, i, 320, 140, 140, 78, theoremId);
    const target = roleTarget(role, base, i, theoremId, 78, anchors);
    assert.ok(Number.isFinite(target.x) && Number.isFinite(target.y), `${shape} ${role} target is not finite`);
  }
  assert.deepEqual([...roles].sort(), ['aether', 'singularity', 'structural']);
}

assert.equal(readMirrorMemory(), null, 'Mirror memory must be safe in non-browser verification');

console.log(
  `Living Black Mirror verifier PASS: 24 theorem fields, ${SHAPES.length} geometries, `
  + `${sampledTargets} particle targets, ${sampledSkeletonPoints} skeleton points, role/anchor/operative invariants.`,
);
