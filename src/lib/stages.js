// ============================================================================
// THE ALCHEMICAL STAGING OF THE GREAT WORK
// The 24 theorems are not pages — they are an initiatory ascent. We map them
// onto the three classical phases of the opus magnum so the entire vessel
// (background, light, the 3D Monad's bloom) darkens, purifies, then exalts.
//
//   NIGREDO (I–VIII)   — the blackening: prima materia, dissolution, the point
//                        descending into the elemental cross. Cold, light-starved.
//   ALBEDO  (IX–XVI)   — the whitening: purification, the lunar silver, the
//                        elements washed and re-proportioned. Clarity emerges.
//   RUBEDO  (XVII–XXIV) — the reddening: exaltation, the solar king, Fiat Lux,
//                        the Stone. The work blazes; this is also where Dee's
//                        explicit color theorems (XXI–XXII) actually fall.
// ============================================================================
export const STAGES = {
  nigredo: { id: 'nigredo', label: 'Nigredo', latin: 'Opus ad Nigrum', gloss: 'The Blackening — dissolution of the prima materia', glow: 0.6 },
  albedo: { id: 'albedo', label: 'Albedo', latin: 'Opus ad Album', gloss: 'The Whitening — purification and the lunar silver', glow: 1.1 },
  rubedo: { id: 'rubedo', label: 'Rubedo', latin: 'Opus ad Rubeum', gloss: 'The Reddening — exaltation and the solar Stone', glow: 1.9 },
};

export function stageForTheorem(id) {
  if (id <= 8) return STAGES.nigredo;
  if (id <= 16) return STAGES.albedo;
  return STAGES.rubedo;
}
