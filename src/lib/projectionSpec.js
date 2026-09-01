// Secondary ritual projections deliberately live outside the canonical Black Mirror.
// The main mirror remains theorem-correct; these forms preserve visually powerful
// geometries as exegesis echoes, operative latent bodies, and transition apparitions.

export const projectionKinds = Object.freeze([
  'axis-cross',
  'vesica',
  'hexagram',
  'radiance',
  'hypercube',
  'metatron',
  'icosahedron',
  'torus',
  'yantra',
  'pentagram',
  'heptadic-rays',
  'sephiroth',
  'spiral',
  'egg',
  'mercurial',
  'four-elements',
  'square-circle',
  'tetractys',
]);

const PROJECTIONS = Object.freeze({
  1:  { echo: 'vesica',         operative: 'hypercube' },
  2:  { echo: 'metatron',       operative: 'radiance' },
  3:  { echo: 'radiance',       operative: 'torus' },
  4:  { echo: 'vesica',         operative: 'hexagram' },
  // Preserve the old elemental-cross silhouette as a relic, while the canonical
  // mirror now correctly resolves the composite Mercurial body.
  5:  { echo: 'axis-cross',     operative: 'mercurial', relic: 'legacy elemental cross' },
  6:  { echo: 'hexagram',       operative: 'heptadic-rays' },
  7:  { echo: 'radiance',       operative: 'tetractys' },
  8:  { echo: 'square-circle',  operative: 'hypercube' },
  // IX formerly carried a hypercube field association. It was semantically wrong
  // for the canonical mirror, but visually compelling, so it survives here.
  9:  { echo: 'hypercube',      operative: 'four-elements', relic: 'legacy dimensional projection' },
  10: { echo: 'pentagram',      operative: 'radiance' },
  11: { echo: 'metatron',       operative: 'torus' },
  12: { echo: 'icosahedron',    operative: 'vesica' },
  13: { echo: 'torus',          operative: 'hypercube' },
  14: { echo: 'yantra',         operative: 'hexagram' },
  15: { echo: 'spiral',         operative: 'torus' },
  16: { echo: 'square-circle',  operative: 'four-elements' },
  17: { echo: 'pentagram',      operative: 'sephiroth' },
  18: { echo: 'egg',            operative: 'metatron' },
  19: { echo: 'sephiroth',      operative: 'metatron' },
  // Preserve the older seven-rayed numerical body as a secondary 252 projection.
  20: { echo: 'heptadic-rays',  operative: 'yantra', relic: 'legacy 252 radiance' },
  21: { echo: 'vesica',         operative: 'torus' },
  22: { echo: 'radiance',       operative: 'sephiroth' },
  23: { echo: 'hypercube',      operative: 'metatron' },
  24: { echo: 'spiral',         operative: 'vesica' },
});

export function getProjectionSpec(theoremId) {
  const id = Number(theoremId) || 1;
  return {
    theoremId: id,
    ...(PROJECTIONS[id] || PROJECTIONS[1]),
  };
}

export const recoveredProjectionRelics = Object.freeze(
  Object.entries(PROJECTIONS)
    .filter(([, value]) => value.relic)
    .map(([theoremId, value]) => ({ theoremId: Number(theoremId), ...value })),
);
