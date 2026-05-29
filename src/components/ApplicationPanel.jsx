import React from 'react';

// The Theurgic Application — the move from reading to operating. Each theorem's
// geometric truth is translated into three registers the modern operator can act
// in: the framing of thought, the architecture of systems, and embodied ritual.
const FACETS = [
  { key: 'cognitive', glyph: '☿', label: 'Cognitive Framing', sub: 'How to think in the shape of this truth' },
  { key: 'architecture', glyph: '⎔', label: 'Architecture', sub: 'How systems take this form' },
  { key: 'ritual', glyph: '☉', label: 'Personal Ritual', sub: 'How to enact it in the body' },
];

export default function ApplicationPanel({ theorem }) {
  const app = theorem.application || {};
  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="font-medieval text-center text-[var(--ink-red)] text-sm tracking-[0.3em] uppercase mb-8 opacity-80">
        Operatio — to operate the theorem, not merely to read it
      </p>
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
