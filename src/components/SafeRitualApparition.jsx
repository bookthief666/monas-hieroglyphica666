import React from 'react';
import RitualProjection from './RitualProjection.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';

export default function SafeRitualApparition({ theoremId, active, safeCompositor = false }) {
  if (!active) return null;

  const projection = getProjectionSpec(theoremId);
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[8] flex items-center justify-center opacity-100 transition-opacity duration-700"
      aria-hidden="true"
    >
      <RitualProjection
        kind={projection.echo}
        variant="apparition"
        charge={0.45}
        className={`w-[68vmin] h-[68vmin] max-w-[760px] max-h-[760px] ${safeCompositor ? '' : 'mix-blend-screen'}`}
      />
    </div>
  );
}
