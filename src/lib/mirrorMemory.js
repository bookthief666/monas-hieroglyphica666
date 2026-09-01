const STORAGE_KEY = 'monas-hieroglyphica:living-mirror:v1';

const FIELD_MODES = Object.freeze({
  coherent: 'cohere',
  radial: 'emanation',
  seed: 'collapse',
  solar: 'radiance',
  lunar: 'lensing',
  axial: 'axis-lock',
  lattice: 'crystallize',
  stellar: 'star-pulse',
  vortex: 'circulation',
  harmonic: 'resonance',
  polyhedral: 'facet-lock',
  toroidal: 'circulation',
  yantric: 'opposition',
  monadic: 'coagula',
  egg: 'gestation',
  sephirothic: 'path-pulse',
  radiant: 'flare',
  hypercube: 'projection',
  spiral: 'winding',
});

function toneForTheorem(theoremId) {
  const id = Number(theoremId) || 1;
  return {
    rootHz: 96 + id * 3,
    ratio: 1 + ((id % 7) * 0.025),
  };
}

function readState() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { totalOperations: 0, theorems: {}, last: null };
    const parsed = JSON.parse(raw);
    return {
      totalOperations: Number(parsed.totalOperations) || 0,
      theorems: parsed.theorems && typeof parsed.theorems === 'object' ? parsed.theorems : {},
      last: parsed.last || null,
    };
  } catch {
    return { totalOperations: 0, theorems: {}, last: null };
  }
}

export function recordMirrorOperation({ theoremId, field, charge, direction = 0, timestamp = Date.now() }) {
  const state = readState();
  if (!state || typeof window === 'undefined' || !window.localStorage) return null;
  const key = String(theoremId);
  const previous = state.theorems[key] || { count: 0, strongestCharge: 0 };
  const mode = FIELD_MODES[field] || 'cohere';
  const tone = toneForTheorem(theoremId);
  const next = {
    totalOperations: state.totalOperations + 1,
    theorems: {
      ...state.theorems,
      [key]: {
        count: previous.count + 1,
        strongestCharge: Math.max(Number(previous.strongestCharge) || 0, Number(charge) || 0),
        lastField: field,
        lastMode: mode,
        lastTone: tone,
        lastDirection: Number(direction) || 0,
        lastTimestamp: timestamp,
      },
    },
    last: { theoremId, field, mode, tone, charge, direction, timestamp },
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return null;
  }
  return next;
}

export function readMirrorMemory() {
  return readState();
}
