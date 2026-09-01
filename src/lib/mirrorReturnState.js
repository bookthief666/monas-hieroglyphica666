const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));

const MODE_RETURN = Object.freeze({
  emanation: { kind: 'radiance', motion: 'radiance' },
  collapse: { kind: 'vesica', motion: 'collapse' },
  radiance: { kind: 'radiance', motion: 'radiance' },
  lensing: { kind: 'vesica', motion: 'lensing' },
  'axis-lock': { kind: 'square-circle', motion: 'axial' },
  crystallize: { kind: 'square-circle', motion: 'crystal' },
  'star-pulse': { kind: 'pentagram', motion: 'stellar' },
  circulation: { kind: 'torus', motion: 'circulation' },
  resonance: { kind: 'tetractys', motion: 'resonance' },
  'facet-lock': { kind: 'icosahedron', motion: 'facet' },
  opposition: { kind: 'yantra', motion: 'opposition' },
  coagula: { kind: 'mercurial', motion: 'coagula' },
  gestation: { kind: 'egg', motion: 'gestation' },
  'path-pulse': { kind: 'sephiroth', motion: 'path' },
  flare: { kind: 'radiance', motion: 'flare' },
  projection: { kind: 'hypercube', motion: 'projection' },
  winding: { kind: 'spiral', motion: 'winding' },
  cohere: { kind: 'metatron', motion: 'cohere' },
});

export function deriveMirrorReturnState(theoremId, continuity) {
  const count = Math.max(0, Number(continuity?.count) || 0);
  if (count <= 0) {
    return {
      active: false,
      theoremId: Number(theoremId) || 1,
      kind: 'metatron',
      motion: 'cohere',
      intensity: 0,
      direction: 0,
      rotationDeg: 0,
      scaleBias: 1,
      pulse: 0,
    };
  }

  const theorem = Number(theoremId) || 1;
  const imprint = clamp(continuity?.imprint);
  const directionRaw = clamp(continuity?.direction, -1, 1);
  const direction = Math.abs(directionRaw) > 0.045 ? Math.sign(directionRaw) : (theorem % 2 === 0 ? -1 : 1);
  const retained = MODE_RETURN[continuity?.mode] || MODE_RETURN.cohere;
  const intensity = clamp(0.035 + imprint * 0.2 + Math.min(count, 5) * 0.006, 0.04, 0.22);
  const rotationDeg = direction * (4 + imprint * 14);
  const scaleBias = 1 + (imprint - 0.4) * 0.018;
  const pulse = clamp(0.18 + imprint * 0.62, 0.18, 0.72);

  return {
    active: true,
    theoremId: theorem,
    kind: retained.kind,
    motion: retained.motion,
    intensity,
    direction,
    rotationDeg,
    scaleBias,
    pulse,
    mode: continuity?.mode || 'cohere',
  };
}

export const mirrorReturnModes = Object.freeze(Object.keys(MODE_RETURN));
