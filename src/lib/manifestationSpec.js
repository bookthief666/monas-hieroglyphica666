const BASE = Object.freeze({
  field: 'coherent',
  physics: {
    radius: 68,
    traceForce: 1.55,
    holdForce: 1.45,
    swirl: 0.22,
    pressureGain: 0.85,
    spring: 0.008,
    damping: 0.825,
    drift: 0.16,
    rippleForce: 0.72,
    rippleSpeed: 0.18,
    energyDecay: 0.92,
  },
  optics: {
    caustic: 0.42,
    engraving: 0.12,
    chroma: 0.14,
    pulse: 0.32,
  },
  motion: {
    hologramSeconds: 20,
    fieldRate: 1,
  },
  tone: {
    rootHz: 110,
    ratio: 1,
  },
});

const FIELD_PRESETS = Object.freeze({
  radial: {
    physics: { traceForce: 1.9, holdForce: 1.25, swirl: 0.08, spring: 0.0085 },
    optics: { caustic: 0.58, engraving: 0.1, chroma: 0.1, pulse: 0.48 },
    motion: { hologramSeconds: 18, fieldRate: 0.9 },
  },
  seed: {
    physics: { radius: 58, traceForce: 1.35, holdForce: 1.8, swirl: 0.14, spring: 0.011 },
    optics: { caustic: 0.38, engraving: 0.09, chroma: 0.08, pulse: 0.28 },
    motion: { hologramSeconds: 24, fieldRate: 0.7 },
  },
  solar: {
    physics: { radius: 74, traceForce: 2.1, holdForce: 1.12, swirl: 0.16, spring: 0.0075 },
    optics: { caustic: 0.68, engraving: 0.08, chroma: 0.18, pulse: 0.62 },
    motion: { hologramSeconds: 16, fieldRate: 1.2 },
  },
  lunar: {
    physics: { radius: 78, traceForce: 1.25, holdForce: 1.72, swirl: 0.5, spring: 0.007 },
    optics: { caustic: 0.52, engraving: 0.13, chroma: 0.22, pulse: 0.34 },
    motion: { hologramSeconds: 26, fieldRate: 0.72 },
  },
  axial: {
    physics: { radius: 64, traceForce: 1.5, holdForce: 1.5, swirl: 0.05, spring: 0.012, damping: 0.79 },
    optics: { caustic: 0.36, engraving: 0.2, chroma: 0.08, pulse: 0.24 },
    motion: { hologramSeconds: 28, fieldRate: 0.62 },
  },
  lattice: {
    physics: { radius: 62, traceForce: 1.35, holdForce: 1.6, swirl: 0.08, spring: 0.014, damping: 0.78, drift: 0.08 },
    optics: { caustic: 0.34, engraving: 0.24, chroma: 0.1, pulse: 0.22 },
    motion: { hologramSeconds: 32, fieldRate: 0.55 },
  },
  stellar: {
    physics: { radius: 76, traceForce: 1.8, holdForce: 1.35, swirl: 0.34, spring: 0.008 },
    optics: { caustic: 0.58, engraving: 0.16, chroma: 0.24, pulse: 0.55 },
    motion: { hologramSeconds: 17, fieldRate: 1.15 },
  },
  vortex: {
    physics: { radius: 82, traceForce: 1.35, holdForce: 1.55, swirl: 0.82, spring: 0.0068, damping: 0.84 },
    optics: { caustic: 0.48, engraving: 0.13, chroma: 0.28, pulse: 0.42 },
    motion: { hologramSeconds: 14, fieldRate: 1.35 },
  },
  harmonic: {
    physics: { radius: 72, traceForce: 1.42, holdForce: 1.42, swirl: 0.28, spring: 0.0085, drift: 0.2 },
    optics: { caustic: 0.44, engraving: 0.14, chroma: 0.2, pulse: 0.4 },
    motion: { hologramSeconds: 21, fieldRate: 1.05 },
  },
  polyhedral: {
    physics: { radius: 66, traceForce: 1.52, holdForce: 1.5, swirl: 0.16, spring: 0.012, damping: 0.8, drift: 0.1 },
    optics: { caustic: 0.4, engraving: 0.26, chroma: 0.14, pulse: 0.3 },
    motion: { hologramSeconds: 19, fieldRate: 0.8 },
  },
  toroidal: {
    physics: { radius: 84, traceForce: 1.22, holdForce: 1.46, swirl: 0.88, spring: 0.0065, damping: 0.845 },
    optics: { caustic: 0.54, engraving: 0.18, chroma: 0.3, pulse: 0.46 },
    motion: { hologramSeconds: 13, fieldRate: 1.4 },
  },
  yantric: {
    physics: { radius: 70, traceForce: 1.58, holdForce: 1.68, swirl: 0.18, spring: 0.0125, damping: 0.79 },
    optics: { caustic: 0.45, engraving: 0.3, chroma: 0.16, pulse: 0.36 },
    motion: { hologramSeconds: 27, fieldRate: 0.75 },
  },
  monadic: {
    physics: { radius: 76, traceForce: 1.52, holdForce: 1.75, swirl: 0.32, spring: 0.011, damping: 0.8 },
    optics: { caustic: 0.62, engraving: 0.22, chroma: 0.18, pulse: 0.5 },
    motion: { hologramSeconds: 22, fieldRate: 0.92 },
  },
  egg: {
    physics: { radius: 74, traceForce: 1.32, holdForce: 1.62, swirl: 0.44, spring: 0.008 },
    optics: { caustic: 0.46, engraving: 0.15, chroma: 0.2, pulse: 0.38 },
    motion: { hologramSeconds: 25, fieldRate: 0.82 },
  },
  sephirothic: {
    physics: { radius: 70, traceForce: 1.34, holdForce: 1.7, swirl: 0.2, spring: 0.013, damping: 0.79, drift: 0.09 },
    optics: { caustic: 0.42, engraving: 0.28, chroma: 0.16, pulse: 0.33 },
    motion: { hologramSeconds: 30, fieldRate: 0.66 },
  },
  radiant: {
    physics: { radius: 88, traceForce: 2.2, holdForce: 1.05, swirl: 0.2, spring: 0.0065, drift: 0.22 },
    optics: { caustic: 0.74, engraving: 0.09, chroma: 0.26, pulse: 0.7 },
    motion: { hologramSeconds: 12, fieldRate: 1.55 },
  },
  hypercube: {
    physics: { radius: 68, traceForce: 1.5, holdForce: 1.55, swirl: 0.12, spring: 0.014, damping: 0.78, drift: 0.08 },
    optics: { caustic: 0.43, engraving: 0.34, chroma: 0.3, pulse: 0.3 },
    motion: { hologramSeconds: 15, fieldRate: 0.9 },
  },
  spiral: {
    physics: { radius: 86, traceForce: 1.2, holdForce: 1.52, swirl: 0.98, spring: 0.006, damping: 0.85, drift: 0.2 },
    optics: { caustic: 0.5, engraving: 0.2, chroma: 0.32, pulse: 0.48 },
    motion: { hologramSeconds: 11, fieldRate: 1.7 },
  },
});

const THEOREM_FIELDS = Object.freeze({
  1: 'radial', 2: 'seed', 3: 'solar', 4: 'lunar', 5: 'axial', 6: 'axial',
  7: 'stellar', 8: 'lattice', 9: 'hypercube', 10: 'stellar', 11: 'harmonic',
  12: 'polyhedral', 13: 'toroidal', 14: 'yantric', 15: 'monadic', 16: 'axial',
  17: 'stellar', 18: 'egg', 19: 'sephirothic', 20: 'lattice', 21: 'lunar',
  22: 'radiant', 23: 'hypercube', 24: 'spiral',
});

const SHAPE_FIELD_HINTS = Object.freeze({
  'line-circle': 'radial', 'point-line-circle': 'seed', 'sun-earth': 'solar',
  'sun-moon': 'lunar', 'cross-rotated': 'axial', 'cross-quaternary': 'axial',
  'triangle-fire': 'radiant', 'square-circle': 'lattice', 'aries-cross': 'monadic',
  metatron: 'lattice', icosahedron: 'polyhedral', torus: 'toroidal',
  'sri-yantra': 'yantric', pentagram: 'stellar', 'sacred-252': 'yantric',
  'monad-full': 'monadic', 'hermetic-egg': 'egg', sephiroth: 'sephirothic',
  'albedo-rubedo': 'lunar', radiance: 'radiant', 'hypercube-stone': 'hypercube',
  'infinite-spiral': 'spiral',
});

function mergeSpec(base, preset) {
  return {
    ...base,
    ...preset,
    physics: { ...base.physics, ...(preset.physics || {}) },
    optics: { ...base.optics, ...(preset.optics || {}) },
    motion: { ...base.motion, ...(preset.motion || {}) },
    tone: { ...base.tone, ...(preset.tone || {}) },
  };
}

export function getManifestationSpec(theoremId, shape) {
  const id = Number(theoremId) || 1;
  const field = THEOREM_FIELDS[id] || SHAPE_FIELD_HINTS[shape] || BASE.field;
  const preset = FIELD_PRESETS[field] || {};
  const merged = mergeSpec(BASE, preset);
  return {
    ...merged,
    theoremId: id,
    shape,
    field,
    tone: {
      ...merged.tone,
      rootHz: 96 + id * 3,
      ratio: 1 + ((id % 7) * 0.025),
    },
  };
}

export const manifestationFields = Object.freeze(Object.keys(FIELD_PRESETS));
