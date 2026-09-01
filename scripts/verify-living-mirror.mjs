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
  theoremMemoryImprint,
  returningWorkState,
  rankConcordances,
} from '../src/lib/ritualContinuity.js';
import { deriveMirrorReturnState, mirrorReturnModes } from '../src/lib/mirrorReturnState.js';
import { getSourceWitness, sourceWitnessTheoremIds } from '../src/lib/sourceWitness.js';

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
assert.deepEqual(sourceWitnessTheoremIds, Array.from({ length: 24 }, (_, index) => index + 1), 'Every theorem needs a 1564 source witness');
assert.equal(new Set(supportedParticleShapes).size, supportedParticleShapes.length);
assert.equal(new Set(projectionKinds).size, projectionKinds.length);
assert.equal(new Set(mirrorReturnModes).size, mirrorReturnModes.length);
assert.ok(recoveredProjectionRelics.length >= 3, 'Recovered geometry reliquary must preserve displaced forms');
assert.deepEqual(
  recoveredProjectionRelics.map((relic) => relic.theoremId).sort((a, b) => a - b),
  [5, 9, 20],
  'The intentionally displaced V, IX, and XX geometries must remain preserved as explicit reliquary witnesses',
);

const pristineReturn = deriveMirrorReturnState(1, deriveRitualContinuity());
assert.equal(pristineReturn.active, false, 'An untouched theorem must not invent an under-glass memory imprint');
assert.equal(pristineReturn.intensity, 0);

let sampledTargets = 0;
let sampledSkeletonPoints = 0;
let sampledRoles = 0;
let verifiedProjections = 0;
let continuityCases = 0;
let memoryImprintCases = 0;
let mirrorReturnCases = 0;
let sourceWitnessCases = 0;

for (const theorem of THEOREMS) {
  const { id: theoremId, shape } = theorem;
  assert.ok(shape, `Theorem ${theoremId} has no particle shape`);
  assert.ok(supportedParticleShapes.includes(shape), `Theorem ${theoremId} uses unsupported particle shape ${shape}`);

  const witness = getSourceWitness(theoremId);
  assert.equal(witness.theoremId, theoremId);
  assert.equal(witness.year, 1564);
  assert.ok(witness.latinIncipit.length > 24, `Theorem ${theoremId} needs a meaningful normalized Latin incipit`);
  assert.match(witness.latinIncipit, /[A-Za-z]/);
  assert.match(witness.facsimileUrl, /^https:\/\//);
  assert.match(witness.catalogueUrl, /^https:\/\//);
  assert.match(witness.transcriptionNote, /Normalized Latin incipit/);
  sourceWitnessCases += 1;

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

  const theoremMemory = {
    count: 3,
    strongestCharge: 0.78,
    lastMode: spec.operative.mode,
    lastDirection: theoremId % 2 === 0 ? -0.45 : 0.45,
    lastTone: spec.tone,
  };
  const lastOperation = {
    theoremId,
    field: spec.field,
    mode: spec.operative.mode,
    charge: 0.64,
    direction: theoremMemory.lastDirection,
    tone: spec.tone,
  };
  const continuity = deriveRitualContinuity({ lastOperation, theoremMemory });
  finiteObject(continuity, `continuity[${theoremId}]`);
  assert.ok(continuity.imprint > 0 && continuity.imprint <= 0.82);
  assert.ok(continuity.exegesisReveal >= 0 && continuity.exegesisReveal <= 0.2);
  assert.ok(continuity.anatomiaTension >= 0 && continuity.anatomiaTension <= 0.72);
  assert.ok(continuity.operatioText.length > 20);

  const returnState = deriveMirrorReturnState(theoremId, continuity);
  assert.equal(returnState.active, true);
  assert.equal(returnState.theoremId, theoremId);
  assert.equal(returnState.mode, spec.operative.mode);
  assert.ok(projectionKinds.includes(returnState.kind), `Theorem ${theoremId} return imprint uses unsupported projection ${returnState.kind}`);
  assert.ok(returnState.intensity >= 0.04 && returnState.intensity <= 0.22);
  assert.ok(Math.abs(returnState.direction) === 1);
  assert.ok(returnState.scaleBias > 0.96 && returnState.scaleBias < 1.04);
  finiteObject(returnState, `returnState[${theoremId}]`);
  mirrorReturnCases += 1;

  const navImprint = theoremMemoryImprint(theoremMemory);
  assert.ok(navImprint > 0 && navImprint <= 0.9, `Theorem ${theoremId} memory residue must be bounded`);
  memoryImprintCases += 1;

  const initialOffsets = initialAnatomiaOffsets(theoremId, continuity);
  assert.deepEqual(Object.keys(initialOffsets).sort(), ['aries', 'crux', 'luna', 'sol']);
  finiteObject(initialOffsets, `anatomia[${theoremId}]`);
  assert.ok(Object.values(initialOffsets).some(([x, y]) => Math.abs(x) + Math.abs(y) > 0));

  for (const register of ['exegesis', 'application', 'operate']) {
    const detail = continuityRegisterDetail(theoremId, register, {
      continuity,
      theoremMemory,
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

const returningMemory = {
  totalOperations: 4,
  last: { theoremId: 23, mode: 'projection', charge: 0.72, direction: -0.35 },
  theorems: {
    23: { count: 4, strongestCharge: 0.81, lastMode: 'projection', lastDirection: -0.35 },
  },
};
const returnState = returningWorkState(returningMemory);
assert.equal(returnState.returning, true);
assert.equal(returnState.theoremId, 23);
assert.equal(returnState.mode, 'projection');
assert.ok(returnState.imprint > 0);
assert.equal(returningWorkState(null).returning, false);

const concordances = [
  { tradition: 'General Hermeticism', figure: 'Mercurius', gloss: 'A general synthetic relation.' },
  { tradition: 'Platonic Geometry', figure: 'Projection of Form', gloss: 'A higher-dimensional body appears through projection.' },
];
const ranked = rankConcordances(concordances, { count: 2, mode: 'projection' });
assert.equal(ranked[0].figure, 'Projection of Form', 'Performed operations must be able to foreground a resonant concordance');

assert.equal(new Set(THEOREMS.map((theorem) => theorem.shape)).size, supportedParticleShapes.length);
assert.equal(verifiedProjections, 48);
assert.equal(continuityCases, 72, 'Every theorem must carry continuity into Exegesis, Operatio, and Anatomia');
assert.equal(memoryImprintCases, 24, 'Every theorem memory must map to bounded ladder residue');
assert.equal(mirrorReturnCases, 24, 'Every worked theorem must map to a bounded under-glass return state');
assert.equal(sourceWitnessCases, 24, 'Every theorem must carry a normalized 1564 witness');
assert.equal(readMirrorMemory(), null, 'Mirror memory must be safe in non-browser verification');

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const apparitionSource = readFileSync(new URL('../src/components/SafeRitualApparition.jsx', import.meta.url), 'utf8');
const metamorphosisSource = readFileSync(new URL('../src/components/RegisterMetamorphosis.jsx', import.meta.url), 'utf8');
const returnImprintSource = readFileSync(new URL('../src/components/MirrorReturnImprint.jsx', import.meta.url), 'utf8');
const thresholdSource = readFileSync(new URL('../src/components/Threshold.jsx', import.meta.url), 'utf8');
const navSource = readFileSync(new URL('../src/components/TheoremNav.jsx', import.meta.url), 'utf8');
const scholarSource = readFileSync(new URL('../src/components/ScholarMargin.jsx', import.meta.url), 'utf8');
const exegesisSealSource = readFileSync(new URL('../src/components/ExegesisSeal.jsx', import.meta.url), 'utf8');
const reliquarySource = readFileSync(new URL('../src/components/ReliquaryIllumination.jsx', import.meta.url), 'utf8');
const sourceWitnessSource = readFileSync(new URL('../src/components/SourceWitness.jsx', import.meta.url), 'utf8');
const marginaliaSource = readFileSync(new URL('../src/components/LivingMarginalia.jsx', import.meta.url), 'utf8');
assert.match(appSource, /queryFlag\('force2d'\)/, 'The clean candidate must retain the explicit 2D QA escape hatch');
assert.match(appSource, /renderer-diagnostic/, 'Renderer diagnostics must remain opt-in and available');
assert.match(appSource, /monas:ritual-register/, 'Register crossings must emit continuity events');
assert.match(appSource, /RegisterMetamorphosis/, 'Register crossings must visibly originate at the shew-stone');
assert.match(appSource, /MirrorReturnImprint/, 'Worked theorem memory must be carried back into the shew-stone');
assert.match(appSource, /resumeTheorem/, 'Re-entry must resume the last worked theorem rather than reset to I');
assert.match(apparitionSource, /if \(!active\) return null;/, 'Inactive theorem apparitions must unmount completely');
assert.match(metamorphosisSource, /if \(!transition\) return null;/, 'Inactive register metamorphosis must unmount completely');
assert.match(returnImprintSource, /deriveMirrorReturnState/, 'The mirror return imprint must derive from the canonical continuity model');
assert.match(thresholdSource, /Re-enter the Work/, 'The Threshold must distinguish first initiation from return');
assert.match(navSource, /theorem-memory-orbit/, 'The theorem ladder must retain non-gamified ritual residue');
assert.match(scholarSource, /rankConcordances/, 'Scholar\'s Margin must be able to foreground operation-resonant concordances');
assert.match(exegesisSealSource, /ReliquaryIllumination/, 'Verbum must visibly restore the recovered animated geometry reliquary');
assert.match(exegesisSealSource, /SourceWitness/, 'Verbum must expose the historical text witness without adding a fifth register');
assert.match(reliquarySource, /projection\.relic/, 'The reliquary plate must explicitly identify deliberately displaced legacy forms');
assert.match(reliquarySource, /LivingMarginalia/, 'The recovered plate must carry living manuscript marginalia');
assert.match(sourceWitnessSource, /1564 Witness/, 'The source layer must clearly distinguish the 1564 witness');
assert.match(marginaliaSource, /stageForTheorem/, 'Living marginalia must inherit the theorem\'s alchemical stage rather than use arbitrary color');

console.log(
  `Living Grimoire IX verifier PASS: 24 canonical theorems, ${verifiedProjections} secondary projections, ${sourceWitnessCases} source witnesses, `
  + `${continuityCases} continuity register cases, ${memoryImprintCases} ladder-memory cases, ${mirrorReturnCases} shew-stone return states, `
  + `${sampledTargets} particle targets, ${sampledSkeletonPoints} skeleton points, ${sampledRoles} role targets, `
  + `${recoveredProjectionRelics.length} recovered relic geometries, source-critical Verbum + living codex reliquary locked.`,
);
