import React from 'react';
import RitualProjection from './RitualProjection.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';

function projectionForRegister(register, projection) {
  if (register === 'application' || register === 'operate') return projection.operative;
  return projection.echo;
}

function variantForRegister(register) {
  return register === 'application' || register === 'operate' ? 'operative' : 'echo';
}

// A register change is treated as one body exposing another organ, not a tab switch.
// The canonical mirror remains untouched; its secondary projections briefly pass
// through the glass and then reappear in the destination register below.
export default function RegisterMetamorphosis({ theoremId, transition, continuity }) {
  if (!transition) return null;

  const projection = getProjectionSpec(theoremId);
  const sourceKind = projectionForRegister(transition.from, projection);
  const targetKind = projectionForRegister(transition.to, projection);
  const sourceVariant = variantForRegister(transition.from);
  const targetVariant = variantForRegister(transition.to);
  const charge = Math.max(0.22, Math.min(0.72, Number(continuity?.registerResonance) || 0));
  const direction = Number(continuity?.direction) || 0;

  return (
    <div
      key={transition.key}
      className={`register-metamorphosis register-metamorphosis-to-${transition.to}`}
      style={{ '--register-turn': `${(direction * 10).toFixed(2)}deg` }}
      aria-hidden="true"
    >
      <div className="register-metamorphosis-source">
        <RitualProjection
          kind={sourceKind}
          variant={sourceVariant}
          charge={charge * 0.7}
          memoryCount={continuity?.count || 0}
          className="w-full h-full"
        />
      </div>
      <div className="register-metamorphosis-target">
        <RitualProjection
          kind={targetKind}
          variant={targetVariant}
          charge={charge}
          memoryCount={continuity?.count || 0}
          className="w-full h-full"
        />
      </div>
      <span className="register-metamorphosis-thread" />
    </div>
  );
}
