import React, { useState } from 'react';
import RitualProjection from './RitualProjection.jsx';
import LivingMarginalia from './LivingMarginalia.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';
import '../vision-completion.css';

const prettyKind = (kind = '') => kind
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export default function ReliquaryIllumination({ theoremId, continuity = null }) {
  const [cycle, setCycle] = useState(0);
  const projection = getProjectionSpec(theoremId);
  const memory = Math.max(0, Number(continuity?.count) || 0);
  const remembered = Math.max(0, Math.min(1, Number(continuity?.imprint) || 0));
  const charge = Math.max(0.24, Math.min(0.68, 0.32 + remembered * 0.38));

  return (
    <section className="reliquary-section w-full max-w-3xl mt-9 md:mt-12" aria-label={`Hidden figure reliquary for Theorem ${theoremId}`}>
      <div className="flex items-end justify-between gap-4 mb-3 px-1">
        <div>
          <p className="font-medieval text-[0.64rem] md:text-xs tracking-[0.3em] uppercase text-[var(--ink-red)] opacity-78">
            Reliquiae Figurarum
          </p>
          <p className="font-roman text-sm md:text-base italic text-[var(--text-muted)] opacity-72 mt-1">
            The hidden diagram condenses, then the operative plate is etched through it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCycle((value) => value + 1)}
          className="reliquary-replay shrink-0 font-medieval text-[0.62rem] tracking-[0.16em] uppercase text-[var(--ink-gold)] border border-[var(--ink-gold)]/25 rounded-full px-3 py-2"
          aria-label="Replay the hidden figure illumination"
        >
          Recast ↻
        </button>
      </div>

      <div
        key={`${theoremId}-${cycle}`}
        className={`reliquary-illumination ${projection.relic ? 'is-recovered-relic' : ''}`}
      >
        <LivingMarginalia theoremId={theoremId} viewMode="reliquary" />
        <div className="reliquary-grid" aria-hidden="true" />
        <div className="reliquary-aura" aria-hidden="true" />
        <div className="reliquary-dust-field" aria-hidden="true" />
        <span className="reliquary-axis reliquary-axis-horizontal" aria-hidden="true" />
        <span className="reliquary-axis reliquary-axis-vertical" aria-hidden="true" />
        <span className="reliquary-center-point" aria-hidden="true" />

        <div className="reliquary-echo" aria-hidden="true">
          <RitualProjection
            kind={projection.echo}
            variant="echo"
            charge={charge * 0.74}
            memoryCount={Math.min(6, memory)}
            className="w-full h-full"
          />
        </div>

        <div className="reliquary-operative" aria-hidden="true">
          <RitualProjection
            kind={projection.operative}
            variant="operative"
            charge={charge}
            memoryCount={Math.min(6, memory)}
            className="w-full h-full"
          />
        </div>

        <div className="reliquary-inscription" aria-hidden="true">
          <span>{prettyKind(projection.echo)}</span>
          <span className="reliquary-separator">☿</span>
          <span>{prettyKind(projection.operative)}</span>
        </div>
      </div>

      <p className={`reliquary-caption font-roman text-xs md:text-sm italic mt-3 px-1 ${projection.relic ? 'text-[var(--ink-gold)]' : 'text-[var(--text-muted)]'}`}>
        {projection.relic
          ? `Reliquiae · ${projection.relic}. Preserved here as a secondary witness; the Black Mirror keeps the theorem-correct canonical body.`
          : 'Figura occulta · a secondary echo and operative body. The canonical theorem remains the body in the Black Mirror.'}
      </p>
    </section>
  );
}
