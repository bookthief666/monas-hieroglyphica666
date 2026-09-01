import React, { useMemo } from 'react';
import RitualProjection from './RitualProjection.jsx';
import { deriveMirrorReturnState } from '../lib/mirrorReturnState.js';

export default function MirrorReturnImprint({ theoremId, continuity }) {
  const state = useMemo(
    () => deriveMirrorReturnState(theoremId, continuity),
    [theoremId, continuity],
  );

  if (!state.active) return null;

  const endRotation = state.rotationDeg + state.direction * 360;
  const style = {
    '--mirror-return-opacity': state.intensity.toFixed(3),
    '--mirror-return-rotation': `${state.rotationDeg.toFixed(2)}deg`,
    '--mirror-return-end-rotation': `${endRotation.toFixed(2)}deg`,
    '--mirror-return-scale': state.scaleBias.toFixed(4),
    '--mirror-return-pulse': state.pulse.toFixed(3),
  };

  return (
    <div
      className={`mirror-return-imprint mirror-return-${state.motion}`}
      style={style}
      data-return-mode={state.mode}
      aria-hidden="true"
    >
      <RitualProjection
        kind={state.kind}
        variant="apparition"
        charge={Math.min(0.42, state.intensity * 1.35)}
        memoryCount={Math.min(3, continuity?.count || 0)}
        className="mirror-return-projection"
      />
    </div>
  );
}
