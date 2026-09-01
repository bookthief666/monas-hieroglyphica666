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
    depth: 0.5,
    skeleton: 0.13,
  },
  motion: {
    hologramSeconds: 20,
    fieldRate: 1,
  },
  operative: {
    mode: 'cohere',
    holdMs: 320,
    chargeMs: 920,
    releaseGain: 1,
    fieldGain: 1,
    spinGain: 1,
  },
  tone: {
    rootHz: 110,
    ratio: 1,
  },
});

const FIELD_PRESETS = Object.freeze({
  radial: {
    physics: { traceForce: 1.9, holdForce: 1.25, swirl: 0.08, spring: 0.0085 },
    optics: { caustic: 0.58, engraving: 0.1, chroma: 0.1, pulse: 0.48, depth: 0.46, skeleton: 0.16 },
    motion: { hologramSeconds: 18, fieldRate: 0.9 },
    operative: { mode: 'emanation', releaseGain: 1.28, fieldGain: 1.2 },
  },
  seed: {
    physics: { radius: 58, traceForce: 1.35, holdForce: 1.8, swirl: 0.14, spring: 0.011 },
    optics: { caustic: 0.38, engraving: 0.09, chroma: 0.08, pulse: 0.28, depth: 0.58, skeleton: 0.14 },
    motion: { hologramSeconds: 24, fieldRate: 0.7 },
    operative: { mode: 'collapse', holdMs: 260, chargeMs: 760, releaseGain: 1.35, fieldGain: 1.35 },
  },
  solar: {
    physics: { radius: 74, traceForce: 2.1, holdForce: 1.12, swirl: 0.16, spring: 0.0075 },
    optics: { caustic: 0.68, engraving: 0.08, chroma: 0.18, pulse: 0.62, depth: 0.48, skeleton: 0.12 },
    motion: { hologramSeconds: 16, fieldRate: 1.2 },
    operative: { mode: 'radiance', holdMs: 280, chargeMs: 720, releaseGain: 1.55, fieldGain: 1.5 },
  },
  lunar: {
    physics: { radius: 78, traceForce: 1.25, holdForce: 1.72, swirl: 0.5, spring: 0.007 },
    optics: { caustic: 0.52, engraving: 0.13, chroma: 0.22, pulse: 0.34, depth: 0.7, skeleton: 0.14 },
    motion: { hologramSeconds: 26, fieldRate: 0.72 },
    operative: { mode: 'lensing', holdMs: 340, chargeMs: 980, releaseGain: 0.9, fieldGain: 1.28, spinGain: 1.3 },
  },
  axial: {
    physics: { radius: 64, traceForce: 1.5, holdForce: 1.5, swirl: 0.05, spring: 0.012, damping: 0.79 },
    optics: { caustic: 0.36, engraving: 0.2, chroma: 0.08, pulse: 0.24, depth: 0.4, skeleton: 0.21 },
    motion: { hologramSeconds: 28, fieldRate: 0.62 },
    operative: { mode: 'axis-lock', holdMs: 300, chargeMs: 820, releaseGain: 0.78, fieldGain: 1.5 },
  },
  lattice: {
    physics: { radius: 62, traceForce: 1.35, holdForce: 1.6, swirl: 0.08, spring: 0.014, damping: 0.78, drift: 0.08 },
    optics: { caustic: 0.34, engraving: 0.24, chroma: 0.1, pulse: 0.22, depth: 0.43, skeleton: 0.24 },
    motion: { hologramSeconds: 32, fieldRate: 0.55 },
    operative: { mode: 'crystallize', holdMs: 360, chargeMs: 980, releaseGain: 0.72, fieldGain: 1.65 },
  },
  stellar: {
    physics: { radius: 76, traceForce: 1.8, holdForce: 1.35, swirl: 0.34, spring: 0.008 },
    optics: { caustic: 0.58, engraving: 0.16, chroma: 0.24, pulse: 0.55, depth: 0.52, skeleton: 0.18 },
    motion: { hologramSeconds: 17, fieldRate: 1.15 },
    operative: { mode: 'star-pulse', holdMs: 290, chargeMs: 780, releaseGain: 1.25, fieldGain: 1.3, spinGain: 1.15 },
  },
  vortex: {
    physics: { radius: 82, traceForce: 1.35, holdForce: 1.55, swirl: 0.82, spring: 0.0068, damping: 0.84 },
    optics: { caustic: 0.48, engraving: 0.13, chroma: 0.28, pulse: 0.42, depth: 0.67, skeleton: 0.14 },
    motion: { hologramSeconds: 14, fieldRate: 1.35 },
    operative: { mode: 'circulation', holdMs: 300, chargeMs: 760, releaseGain: 1.1, fieldGain: 1.38, spinGain: 1.7 },
  },
  harmonic: {
    physics: { radius: 72, traceForce: 1.42, holdForce: 1.42, swirl: 0.28, spring: 0.0085, drift: 0.2 },
    optics: { caustic: 0.44, engraving: 0.14, chroma: 0.2, pulse: 0.4, depth: 0.56, skeleton: 0.16 },
    motion: { hologramSeconds: 21, fieldRate: 1.05 },
    operative: { mode: 'resonance', holdMs: 320, chargeMs: 900, releaseGain: 1.02, fieldGain: 1.3 },
  },
  polyhedral: {
    physics: { radius: 66, traceForce: 1.52, holdForce: 1.5, swirl: 0.16, spring: 0.012, damping: 0.8, drift: 0.1 },
    optics: { caustic: 0.4, engraving: 0.26, chroma: 0.14, pulse: 0.3, depth: 0.62, skeleton: 0.25 },
    motion: { hologramSeconds: 19, fieldRate: 0.8 },
    operative: { mode: 'facet-lock', holdMs: 340, chargeMs: 920, releaseGain: 0.84, fieldGain: 1.48 },
  },
  toroidal: {
    physics: { radius: 84, traceForce: 1.22, holdForce: 1.46, swirl: 0.88, spring: 0.0065, damping: 0.845 },
    optics: { caustic: 0.54, engraving: 0.18, chroma: 0.3, pulse: 0.46, depth: 0.72, skeleton: 0.17 },
    motion: { hologramSeconds: 13, fieldRate: 1.4 },
    operative: { mode: 'circulation', holdMs: 280, chargeMs: 720, releaseGain: 1.18, fieldGain: 1.5, spinGain: 2.1 },
  },
  yantric: {
    physics: { radius: 70, traceForce: 1.58, holdForce: 1.68, swirl: 0.18, spring: 0.0125, damping: 0.79 },
    optics: { caustic: 0.45, engraving: 0.3, chroma: 0.16, pulse: 0.36, depth: 0.51, skeleton: 0.28 },
    motion: { hologramSeconds: 27, fieldRate: 0.75 },
    operative: { mode: 'opposition', holdMs: 330, chargeMs: 880, releaseGain: 0.92, fieldGain: 1.52 },
  },
  monadic: {
    physics: { radius: 76, traceForce: 1.52, holdForce: 1.75, swirl: 0.32, spring: 0.011, damping: 0.8 },
    optics: { caustic: 0.62, engraving: 0.22, chroma: 0.18, pulse: 0.5, depth: 0.6, skeleton: 0.22 },
    motion: { hologramSeconds: 22, fieldRate: 0.92 },
    operative: { mode: 'coagula', holdMs: 300, chargeMs: 860, releaseGain: 1.12, fieldGain: 1.55 },
  },
  egg: {
    physics: { radius: 74, traceForce: 1.32, holdForce: 1.62, swirl: 0.44, spring: 0.008 },
    optics: { caustic: 0.46, engraving: 0.15, chroma: 0.2, pulse: 0.38, depth: 0.68, skeleton: 0.14 },
    motion: { hologramSeconds: 25, fieldRate: 0.82 },
    operative: { mode: 'gestation', holdMs: 420, chargeMs: 1100, releaseGain: 1.05, fieldGain: 1.32 },
  },
  sephirothic: {
    physics: { radius: 70, traceForce: 1.34, holdForce: 1.7, swirl: 0.2, spring: 0.013, damping: 0.79, drift: 0.09 },
    optics: { caustic: 0.42, engraving: 0.28, chroma: 0.16, pulse: 0.33, depth: 0.58, skeleton: 0.27 },
    motion: { hologramSeconds: 30, fieldRate: 0.66 },
    operative: { mode: 'path-pulse', holdMs: 360, chargeMs: 980, releaseGain: 0.88, fieldGain: 1.6 },
  },
  radiant: {
    physics: { radius: 88, traceForce: 2.2, holdForce: 1.05, swirl: 0.2, spring: 0.0065, drift: 0.22 },
    optics: { caustic: 0.74, engraving: 0.09, chroma: 0.26, pulse: 0.7, depth: 0.46, skeleton: 0.12 },
    motion: { hologramSeconds: 12, fieldRate: 1.55 },
    operative: { mode: 'flare', holdMs: 240, chargeMs: 640, releaseGain: 1.75, fieldGain: 1.7 },
  },
  hypercube: {
    physics: { radius: 68, traceForce: 1.5, holdForce: 1.55, swirl: 0.12, spring: 0.014, damping: 0.78, drift: 0.08 },
    optics: { caustic: 0.43, engraving: 0.34, chroma: 0.3, pulse: 0.3, depth: 0.76, skeleton: 0.3 },
    motion: { hologramSeconds: 15, fieldRate: 0.9 },
    operative: { mode: 'projection', holdMs: 320, chargeMs: 900, releaseGain: 0.95, fieldGain: 1.58, spinGain: 1.35 },
  },
  spiral: {
    physics: { radius: 86, traceForce: 1.2, holdForce: 1.52, swirl: 0.98, spring: 0.006, damping: 0.85, drift: 0.2 },
    optics: { caustic: 0.5, engraving: 0.2, chroma: 0.32, pulse: 0.48, depth: 0.72, skeleton: 0.19 },
    motion: { hologramSeconds: 11, fieldRate: 1.7 },
    operative: { mode: 'winding', holdMs: 260, chargeMs: 720, releaseGain: 1.28, fieldGain: 1.62, spinGain: 2.35 },
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
    operative: { ...base.operative, ...(preset.operative || {}) },
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
