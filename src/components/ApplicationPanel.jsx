import React from 'react';
import RitualProjection from './RitualProjection.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';
import useMirrorRitual from '../lib/useMirrorRitual.js';

const FACETS = [
  { key: 'cognitive', glyph: '☿', label: 'Cognitive Framing', sub: 'How to think in the shape of this truth' },
  { key: 'architecture', glyph: '⎔', label: 'Architecture', sub: 'How systems take this form' },
  { key: 'ritual', glyph: '☉', label: 'Personal Ritual', sub: 'How to enact it in the body' },
];

export default function ApplicationPanel({ theorem }) {
  const app = theorem.application || {};
  const projection = getProjectionSpec(theorem.id);
  const { lastOperation, memoryCount, continuity } = useMirrorRitual(theorem.id);
  const charge = continuity.imprint;

  return (
    <div
      className="w-full max-w-3xl mx-auto ritual-register-received"
      style={{ '--ritual-register-charge': continuity.registerResonance }}
    >
      <p className="font-medieval text-center text-[var(--ink-red)] text-sm tracking-[0.3em] uppercase mb-8 opacity-80">
        Operatio — to operate the theorem, not merely to read it
      </p>

      {memoryCount > 0 && (
        <div className="relative overflow-hidden mb-7 rounded-lg border border-[var(--ink-gold)]/20 bg-black/25 px-4 py-3 flex items-center gap-4">
          <RitualProjection
            kind={projection.operative}
            variant="operative"
            charge={charge}
            memoryCount={memoryCount}
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 mix-blend-screen"
          />
          <div className="min-w-0">
            <span className="font-medieval text-[0.65rem] tracking-[0.28em] uppercase text-[var(--ink-gold)] opacity-80">
              Vestigium Operis
            </span>
            <p className="font-roman italic text-[var(--text-muted)] text-sm md:text-base opacity-85 leading-relaxed">
              The shew-stone remembers {continuity.label}{lastOperation?.mode ? ` — ${lastOperation.mode}` : ''}.
            </p>
            <p className="font-roman italic text-sm md:text-base leading-relaxed mt-1 ritual-residue-line">
              {continuity.operatioText}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {FACETS.map((f) => (
          <div
            key={f.key}
            className="parchment-panel rounded-lg p-5 md:p-6 border border-[var(--ink-gold)]/15 transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[var(--ink-red)] text-2xl leading-none drop-shadow-[0_0_10px_rgba(255,68,68,0.6)]">{f.glyph}</span>
              <div>
                <h4 className="font-blackletter text-[var(--ink-gold)] text-xl glow-gold leading-tight">{f.label}</h4>
                <span className="font-medieval text-[var(--text-muted)] text-[0.7rem] tracking-[0.15em] uppercase opacity-70">{f.sub}</span>
              </div>
            </div>
            <p className="font-roman text-[var(--text-main)] text-lg md:text-xl leading-relaxed">
              {app[f.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
