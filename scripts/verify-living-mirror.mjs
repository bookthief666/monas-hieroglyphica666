import assert from 'node:assert/strict';
import { getManifestationSpec, manifestationFields } from '../src/lib/manifestationSpec.js';
import { targetForParticle } from '../src/lib/particleGeometry.js';

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
}

for (const shape of SHAPES) {
  for (let i = 0; i < 320; i += 1) {
    const point = targetForParticle(shape, i, 320, 140, 140, 78, (i % 24) + 1);
    assert.ok(Number.isFinite(point.x), `${shape}[${i}].x is not finite`);
    assert.ok(Number.isFinite(point.y), `${shape}[${i}].y is not finite`);
    assert.ok(Math.abs(point.x) < 1000 && Math.abs(point.y) < 1000, `${shape}[${i}] escaped the mirror`);
  }
}

console.log(`Living Black Mirror verifier PASS: 24 theorem fields, ${SHAPES.length} geometries, ${SHAPES.length * 320} sampled targets.`);
