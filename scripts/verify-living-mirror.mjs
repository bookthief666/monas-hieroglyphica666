import assert from 'node:assert/strict';
import { THEOREMS } from '../src/data/theorems.js';
import { getManifestationSpec, manifestationFields } from '../src/lib/manifestationSpec.js';
import { supportedParticleShapes, targetForParticle } from '../src/lib/particleGeometry.js';
import {
  buildSkeletonSegments,
  particleRole,
  roleTarget,
  singularityAnchors,
} from '../src/lib/mirrorGeometry.js';
import { readMirrorMemory } from '../src/lib/mirrorMemory.js';
import {
  getProjectionSpec,
  projectionKinds,
  recoveredProjectionRelics,
} from '../src/lib/projectionSpec.js';

const EXPECTED_FIELDS = Object.freeze({
  1: 'radial',
  2: 'seed',
  3: 'solar',
  4: 'lunar',
  5: 'harmonic',
  6: 'axial',
  7: 'radiant',
  8: 'lattice',
  9: 'radial',
  10: 'radiant',
  11: 'harmonic',
  12: 'lunar',
  13: 'toroidal',
  14: 'yantric',
  15: 'monadic',
  16: 'axial',
  17: 'stellar',
  18: 'egg',
  19: 'sephirothic',
  20: 'harmonic',
  21: 'lunar',
  22: 'radiant',
  23: 'hypercube',
  24: 'spiral',
});

function finiteObject(obj, path = 'value') {
  for (const [key, value] of Object.entries(obj)) {
    const next = `${path}.${key}`;
    if (typeof value === 'number') assert.ok(Number.isFinite(value), `${next} must be finite`);
    else if (value && typeof value === 'object') finiteObject(value, next);
  }
}

assert.equal(THEOREMS.length, 24, 'The Living Grimoire must contain exactly 24 theorems');
assert.deepEqual(
  THEOREMS.map((theorem) => theorem.id),
  Array.from({ length: 24 }, (_, index) => index + 1),
  'Theorem ids must remain the contiguous Dee sequence I–XXIV',
);
assert.equal(new Set(supportedParticleShapes).size, supportedParticleShapes.length, 'Supported particle shapes must be unique');
assert.equal(new Set(projectionKinds).size, projectionKinds.length, 'Secondary projection kinds must be unique');
assert.ok(recoveredProjectionRelics.length >= 3, 'Recovered geometry reliquary must preserve displaced forms');

let sampledTargets = 0;
let sampledSkeletonPoints = 0;
let sampledRoles = 0;
let verifiedProjections = 0;

for (const theorem of THEOREMS) {
  const { id: theoremId, shape } = theorem;
  assert.ok(shape, `Theorem ${theoremId} has no particle shape`);
  assert.ok(
    supportedParticleShapes.includes(shape),
    `Theorem ${theoremId} uses unsupported particle shape ${shape}`,
  );

  const spec = getManifestationSpec(theoremId, shape);
  assert.equal(spec.theoremId, theoremId);
  assert.equal(spec.shape, shape);
  assert.ok(manifestationFields.includes(spec.field), `Theorem ${theoremId} has an unknown field`);
  assert.equal(
    spec.field,
    EXPECTED_FIELDS[theoremId],
    `Theorem ${theoremId} field drifted from its audited semantic law`,
  );
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

  const projection = getProjectionSpec(theoremId);
  assert.equal(projection.theoremId, theoremId);
  assert.ok(projectionKinds.includes(projection.echo), `Theorem ${theoremId} has unsupported echo projection ${projection.echo}`);
  assert.ok(projectionKinds.includes(projection.operative), `Theorem ${theoremId} has unsupported operative projection ${projection.operative}`);
  verifiedProjections += 2;

  const count = 360;
  for (let index = 0; index < count; index += 1) {
    const point = targetForParticle(shape, index, count, 140, 140, 78, theoremId);
    assert.ok(Number.isFinite(point.x), `${shape}[${index}].x is not finite`);
    assert.ok(Number.isFinite(point.y), `${shape}[${index}].y is not finite`);
    assert.ok(Math.abs(point.x) < 1000 && Math.abs(point.y) < 1000, `${shape}[${index}] escaped the mirror`);
    sampledTargets += 1;
  }

  const skeleton = buildSkeletonSegments(shape, 140, 140, 78, theoremId, 320);
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
  for (let index = 0; index < count; index += 1) {
    const role = particleRole(index, theoremId);
    roles.add(role);
    const base = targetForParticle(shape, index, count, 140, 140, 78, theoremId);
    const target = roleTarget(role, base, index, theoremId, 78, anchors);
    assert.ok(Number.isFinite(target.x) && Number.isFinite(target.y), `${shape} ${role} target is not finite`);
    sampledRoles += 1;
  }
  assert.deepEqual([...roles].sort(), ['aether', 'singularity', 'structural']);
}

assert.equal(
  new Set(THEOREMS.map((theorem) => theorem.shape)).size,
  supportedParticleShapes.length,
  'Supported particle geometry catalog must match the 24 live theorem shapes exactly',
);
assert.equal(verifiedProjections, 48, 'Every theorem must have one echo and one operative projection');
assert.equal(readMirrorMemory(), null, 'Mirror memory must be safe in non-browser verification');

console.log(
  `Living Black Mirror verifier PASS: 24/24 canonical theorem shapes, ${verifiedProjections} secondary projections, `
  + `${sampledTargets} particle targets, ${sampledSkeletonPoints} skeleton points, ${sampledRoles} role targets, `
  + `${recoveredProjectionRelics.length} recovered relic geometries, semantic field map locked.`,
);
