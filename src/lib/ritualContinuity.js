const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));

const MODE_LANGUAGE = Object.freeze({
  emanation: {
    label: 'emanation retained',
    operatio: 'The residue still tends outward. Begin by giving the operation a single centre, then let consequence radiate from it rather than multiplying causes.',
  },
  collapse: {
    label: 'the point retained',
    operatio: 'The residue contracts toward a punctum. Strip the operation to the irreducible seed before permitting extension, ornament, or explanation.',
  },
  radiance: {
    label: 'solar pressure retained',
    operatio: 'The residue carries excess emission. Work by clarifying what must shine and what must remain unilluminated; indiscriminate radiance destroys form.',
  },
  lensing: {
    label: 'lunar curvature retained',
    operatio: 'The residue bends relation rather than forcing it. Alter angle, distance, reflection, and reception before altering the thing itself.',
  },
  'axis-lock': {
    label: 'the axes retained',
    operatio: 'The residue seeks orthogonality. Re-establish the governing axes first; secondary motion should be judged by whether it serves or distorts them.',
  },
  crystallize: {
    label: 'the lattice retained',
    operatio: 'The residue prefers repetition and constraint. Let a small rule propagate until a stable architecture appears instead of designing the whole at once.',
  },
  'star-pulse': {
    label: 'the stellar interval retained',
    operatio: 'The residue alternates centre and extremity. Work rhythmically: contract to principle, extend to consequence, then return to the centre for correction.',
  },
  circulation: {
    label: 'circulation retained',
    operatio: 'The residue is still moving around its centre. Do not interrupt the circuit; change its rate, direction, or aperture until the same current performs another work.',
  },
  resonance: {
    label: 'the interval retained',
    operatio: 'The residue answers proportion more readily than force. Seek the interval that causes separate parts to reinforce one another, then tune rather than push.',
  },
  'facet-lock': {
    label: 'the facets retained',
    operatio: 'The residue has become many-sided. Change one face at a time while preserving the relations that make the whole object intelligible.',
  },
  opposition: {
    label: 'the opposed triangles retained',
    operatio: 'The residue depends upon tension between opposed motions. Preserve the contradiction long enough for a third structure to emerge from their interpenetration.',
  },
  coagula: {
    label: 'coagulation retained',
    operatio: 'The residue is already seeking synthesis. Bring separated members home without erasing their distinction; coherence is not sameness.',
  },
  gestation: {
    label: 'the vessel retained',
    operatio: 'The residue remains enclosed. Protect the operation from premature exposure and allow internal differentiation before demanding an external result.',
  },
  'path-pulse': {
    label: 'the paths retained',
    operatio: 'The residue persists as a network. Change a node only with attention to the paths it excites; local action is already distributed action.',
  },
  flare: {
    label: 'the flare retained',
    operatio: 'The residue is near discharge. Give the excess a deliberate channel so culmination becomes revelation rather than dissipation.',
  },
  projection: {
    label: 'the projection retained',
    operatio: 'The residue suggests a higher body than the visible figure. Change the projection before deciding that the structure itself is impossible.',
  },
  winding: {
    label: 'the winding retained',
    operatio: 'The residue remembers direction. Tighten to concentrate, unwind to release; the same spiral can bind or open according to the hand that turns it.',
  },
  cohere: {
    label: 'coherence retained',
    operatio: 'The residue is relational rather than local. Preserve the proportion among parts while changing their expression.',
  },
});

export function deriveRitualContinuity({ lastOperation = null, theoremMemory = null } = {}) {
  const count = Math.max(0, Number(theoremMemory?.count) || 0);
  const strongest = clamp(theoremMemory?.strongestCharge);
  const lastCharge = clamp(lastOperation?.charge ?? strongest * 0.72);
  const direction = clamp(lastOperation?.direction ?? theoremMemory?.lastDirection, -1, 1);
  const mode = lastOperation?.mode || theoremMemory?.lastMode || 'cohere';
  const language = MODE_LANGUAGE[mode] || MODE_LANGUAGE.cohere;

  // Deliberately saturates early: this is ritual residue, not a levelling system.
  const countWeight = Math.min(0.16, Math.log2(count + 1) * 0.055);
  const imprint = count > 0
    ? clamp(0.08 + strongest * 0.46 + lastCharge * 0.2 + countWeight, 0, 0.82)
    : 0;

  return {
    count,
    mode,
    direction,
    imprint,
    exegesisReveal: count > 0 ? clamp(0.035 + imprint * 0.22, 0, 0.2) : 0,
    anatomiaTension: count > 0 ? clamp(0.12 + imprint * 0.72, 0, 0.72) : 0,
    registerResonance: count > 0 ? clamp(0.08 + imprint * 0.7, 0, 0.64) : 0,
    label: language.label,
    operatioText: language.operatio,
  };
}

const PART_IDS = ['luna', 'sol', 'crux', 'aries'];

export function initialAnatomiaOffsets(theoremId, continuity) {
  if (!continuity || continuity.count <= 0 || continuity.anatomiaTension <= 0) {
    return Object.fromEntries(PART_IDS.map((id) => [id, [0, 0]]));
  }

  const tension = continuity.anatomiaTension;
  const magnitude = 4 + tension * 16;
  const direction = continuity.direction;
  const base = (Number(theoremId) || 1) * 0.61803398875 + direction * Math.PI * 0.7;
  const mode = continuity.mode;

  return Object.fromEntries(PART_IDS.map((id, index) => {
    const theta = base + index * Math.PI / 2;
    let dx = Math.cos(theta) * magnitude;
    let dy = Math.sin(theta) * magnitude;

    if (mode === 'axis-lock' || mode === 'crystallize') {
      dx = index % 2 === 0 ? (index === 0 ? -magnitude : magnitude) : 0;
      dy = index % 2 === 1 ? (index === 1 ? -magnitude : magnitude) : 0;
    } else if (mode === 'circulation' || mode === 'winding' || mode === 'lensing') {
      const tangent = direction === 0 ? 1 : Math.sign(direction);
      dx = -Math.sin(theta) * magnitude * tangent;
      dy = Math.cos(theta) * magnitude * tangent;
    } else if (mode === 'collapse' || mode === 'coagula') {
      dx *= 0.45;
      dy *= 0.45;
    }

    return [id, [dx, dy]];
  }));
}

export function continuityRegisterDetail(theoremId, register, ritual) {
  const continuity = ritual?.continuity || deriveRitualContinuity({
    lastOperation: ritual?.lastOperation,
    theoremMemory: ritual?.theoremMemory,
  });
  return {
    theoremId: Number(theoremId) || 1,
    register,
    charge: continuity.registerResonance,
    mode: continuity.mode,
    direction: continuity.direction,
    tone: ritual?.theoremMemory?.lastTone || ritual?.lastOperation?.tone || null,
  };
}
