import React from 'react';
import HolographicSigil from './HolographicSigil.jsx';
import RitualProjection from './RitualProjection.jsx';
import ReliquaryIllumination from './ReliquaryIllumination.jsx';
import SourceWitness from './SourceWitness.jsx';
import { THEOREMS } from '../data/theorems.js';
import { getProjectionSpec } from '../lib/projectionSpec.js';
import useMirrorRitual from '../lib/useMirrorRitual.js';

export default function ExegesisSeal({ theoremId, onClick, dimmed, label }) {
  const projection = getProjectionSpec(theoremId);
  const theorem = THEOREMS.find((item) => item.id === Number(theoremId)) || THEOREMS[0];
  const { lastOperation, memoryCount, strongestCharge, continuity } = useMirrorRitual(theoremId);
  const charge = Math.max(
    Number(lastOperation?.charge) || 0,
    Math.min(0.55, strongestCharge * 0.45),
  );

  return (
    <div className="relative w-full flex flex-col items-center">
      {!dimmed && (
        <>
          <ReliquaryIllumination theoremId={theoremId} continuity={continuity} />
          <SourceWitness theorem={theorem} />
        </>
      )}

      <div className={`relative w-full flex justify-center ${dimmed ? '' : 'mt-4 md:mt-6'}`}>
        <div
          className={`absolute pointer-events-none left-1/2 -translate-x-1/2 top-8 md:top-10 transition-all duration-700 mix-blend-screen ${dimmed ? 'scale-110 opacity-100' : 'scale-95 opacity-65'}`}
          aria-hidden="true"
        >
          <RitualProjection
            kind={projection.echo}
            variant="echo"
            charge={dimmed ? Math.max(charge, 0.32) : charge * 0.55}
            memoryCount={memoryCount}
            className="w-40 h-40 md:w-60 md:h-60"
          />
        </div>

        <div className="relative z-10 w-full">
          <HolographicSigil
            theoremId={theoremId}
            onClick={onClick}
            dimmed={dimmed}
            label={label}
          />
        </div>
      </div>
    </div>
  );
}
