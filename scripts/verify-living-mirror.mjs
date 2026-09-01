import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
import {
  deriveRitualContinuity,
  initialAnatomiaOffsets,
  continuityRegisterDetail,
} from '../src/lib/ritualContinuity.js';

const EXPECTED_FIELDS = Object.freeze({
  1: 'radial', 2: 'seed', 3: 'solar', 4: 'lunar', 5: 'harmonic', 6: 'axial',
  7: 'radiant', 8: 'lattice', 9: 'radial', 10: 'radiant', 11: 'harmonic', 12: 'lunar',
  13: 'toroidal', 14: 'yantric', 15: 'monadic', 16: 'axial', 17: 'stellar', 18: 'egg',
  19: 'sephirothic', 20: 'harmonic', 21: 'lunar', 22: 'radiant', 23: 'hypercube', 24: 'spiral',
});

function finiteObject(obj, path = 'value') {
  for (const [key, value] of Object.entries(obj)) {
    const next = `${path}.${key}`;
    if (typeof value === 'number') assert.ok(Number.isFinite(value), `${next} must be finite`);
    else if (value && typeof value === 'object') finiteObject(value, next);
  }
}

assert.equal(THEOREMS.length, 24, 'The Living Grimoire must contain exactly 24 theorems');
assert.deepEqual(THEOREMS.map((theorem) => theorem.id), Array.from({ length: 24 }, (_, index) => index + 1));
assert.equal(new Set(supportedParticleShapes).size, supportedParticleShapes.length);
assert.equal(new Set(projectionKinds).size, projectionKinds.length);
assert.ok(recoveredProjectionRelics.length >= 3, 'Recovered geometry reliquary must preserve displaced forms');

let sampledTargets = 0;
let sampledSkeletonPoints = 0;
let sampledRoles = 0;
let verifiedProjections = 0;
let continuityCases = 0;

for (const theorem of THEOREMS) {
  const { id: theoremId, shape } = theorem;
  assert.ok(shape, `Theorem ${theoremId} has no particle shape`);
  assert.ok(supportedParticleShapes.includes(shape), `Theorem ${theoremId} uses unsupported particle shape ${shape}`);

  const spec = getManifestationSpec(theoremId, shape);
  assert.equal(spec.theoremId, theoremId);
  assert.equal(spec.shape, shape);
  assert.ok(manifestationFields.includes(spec.field));
  assert.equal(spec.field, EXPECTED_FIELDS[theoremId], `Theorem ${theoremId} field drifted from its audited semantic law`);
  finiteObject(spec, `theorem[${theoremId}]`);
  assert.ok(spec.physics.radius > 0);
  assert.ok(spec.physics.spring > 0);
  assert.ok(spec.physics.damping > 0 && spec.physics.damping < 1);
  assert.ok(spec.optics.depth >= 0 && spec.optics.depth <= 1);
  assert.ok(spec.optics.skeleton >= 0 && spec.optics.skeleton <= 1);
  assert.equal(typeof spec.operative.mode, 'string');
  assert.ok(spec.operative.holdMs >= 200 && spec.operative.holdMs <= 1000);
  assert.ok(spec.operative.chargeMs >= 400 && spec.operative.chargeMs <= 2000);

  const projection = getProjectionSpec(theoremId);
  assert.equal(projection.theoremId, theoremId);
  assert.ok(projectionKinds.includes(projection.echo));
  assert.ok(projectionKinds.includes(projection.operative));
  verifiedProjections += 2;

  const continuity = deriveRitualContinuity({
    lastOperation: {
      theoremId,
      field: spec.field,
      mode: spec.operative.mode,
      charge: 0.64,
      direction: theoremId % 2 === 0 ? -0.45 : 0.45,
      tone: spec.tone,
    },
    theoremMemory: {
      count: 3,
      strongestCharge: 0.78,
      lastMode: spec.operative.mode,
      lastDirection: 0.45,
      lastTone: spec.tone,
    },
  });
  finiteObject(continuity, `continuity[${theoremId}]`);
  assert.ok(continuity.imprint > 0 && continuity.imprint <= 0.82);
  assert.ok(continuity.exegesisReveal >= 0 && continuity.exegesisReveal <= 0.2);
  assert.ok(continuity.anatomiaTension >= 0 && continuity.anatomiaTension <= 0.72);
  assert.ok(continuity.operatioText.length > 20);

  const initialOffsets = initialAnatomiaOffsets(theoremId, continuity);
  assert.deepEqual(Object.keys(initialOffsets).sort(), ['aries', 'crux', 'luna', 'sol']);
  finiteObject(initialOffsets, `anatomia[${theoremId}]`);
  assert.ok(Object.values(initialOffsets).some(([x, y]) => Math.abs(x) + Math.abs(y) > 0));

  for (const register of ['exegesis', 'application', 'operate']) {
    const detail = continuityRegisterDetail(theoremId, register, {
      continuity,
      theoremMemory: { lastTone: spec.tone },
    });
    assert.equal(detail.theoremId, theoremId);
    assert.equal(detail.register, register);
    assert.ok(detail.charge >= 0 && detail.charge <= 0.64);
    continuityCases += 1;
  }

  const count = 360;
  for (let index = 0; index < count; index += 1) {
    const point = targetForParticle(shape, index, count, 140, 140, 78, theoremId);
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
    assert.ok(Math.abs(point.x) < 1000 && Math.abs(point.y) < 1000);
    sampledTargets += 1;
  }

  const skeleton = buildSkeletonSegments(shape, 140, 140, 78, theoremId, 320);
  assert.ok(skeleton.length > 0);
  for (const segment of skeleton) {
    assert.ok(segment.length > 1);
    for (const point of segment) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
      sampledSkeletonPoints += 1;
    }
  }

  const anchors = singularityAnchors(shape, 140, 140, 78);
  assert.ok(anchors.length > 0);
  anchors.forEach((point) => assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y)));

  const roles = new Set();
  for (let index = 0; index < count; index += 1) {
    const role = particleRole(index, theoremId);
    roles.add(role);
    const base = targetForParticle(shape, index, count, 140, 140, 78, theoremId);
    const target = roleTarget(role, base, index, theoremId, 78, anchors);
    assert.ok(Number.isFinite(target.x) && Number.isFinite(target.y));
    sampledRoles += 1;
  }
  assert.deepEqual([...roles].sort(), ['aether', 'singularity', 'structural']);
}

assert.equal(new Set(THEOREMS.map((theorem) => theorem.shape)).size, supportedParticleShapes.length);
assert.equal(verifiedProjections, 48);
assert.equal(continuityCases, 72, 'Every theorem must carry continuity into Exegesis, Operatio, and Anatomia');
assert.equal(readMirrorMemory(), null, 'Mirror memory must be safe in non-browser verification');

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const apparitionSource = readFileSync(new URL('../src/components/SafeRitualApparition.jsx', import.meta.url), 'utf8');
assert.match(appSource, /queryFlag\('force2d'\)/, 'The clean candidate must retain the explicit 2D QA escape hatch');
assert.match(appSource, /renderer-diagnostic/, 'Renderer diagnostics must remain opt-in and available');
assert.match(appSource, /monas:ritual-register/, 'Register crossings must emit continuity events');
assert.match(apparitionSource, /if \(!active\) return null;/, 'Inactive theorem apparitions must unmount completely');

console.log(
  `Living Grimoire V verifier PASS: 24 canonical theorems, ${verifiedProjections} secondary projections, `
  + `${continuityCases} continuity register cases, ${sampledTargets} particle targets, `
  + `${sampledSkeletonPoints} skeleton points, ${sampledRoles} role targets, `
  + `${recoveredProjectionRelics.length} recovered relic geometries.`,
);
