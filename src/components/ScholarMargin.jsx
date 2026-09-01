import React, { useState } from 'react';
import { rankConcordances } from '../lib/ritualContinuity.js';

// A single comparative cross-reference: tradition + figure as a header that
// expands to reveal the gloss connecting Dee's geometry to the wider tapestry.
// When the theorem has been worked, the operation may draw one concordance to
// the front; the scholarship itself is never rewritten.
function CrossRefCard({ xref, defaultOpen, resonant = false }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`border-l-2 pl-3 mb-3 transition-all ${resonant ? 'scholar-resonant-concordance border-[var(--ink-gold)]/55' : 'border-[var(--ink-gold)]/30'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-left w-full group"
      >
        <span className="block font-medieval text-[var(--ink-red)] text-[0.7rem] tracking-[0.2em] uppercase opacity-90">
          {xref.tradition}{resonant ? <span className="ml-2 text-[var(--ink-gold)] opacity-70">✶</span> : null}
        </span>
        <span className="block font-roman text-[var(--ink-gold)] text-sm italic group-hover:text-white transition-colors">
          {xref.figure}
          <span className="text-[var(--ink-gold)]/50 ml-2">{open ? '−' : '+'}</span>
        </span>
      </button>
      {open && (
        <p className="font-roman text-[var(--text-muted)] text-sm leading-relaxed mt-1 opacity-90">
          {xref.gloss}
        </p>
      )}
    </div>
  );
}

function GlossaryChip({ term, definition }) {
  const [tip, setTip] = useState(null);
  const [pinned, setPinned] = useState(false);

  const show = (e) => setTip({ x: e.clientX, y: e.clientY });
  const hide = () => { if (!pinned) setTip(null); };

  return (
    <>
      <button
        className="xref-term font-roman text-sm mr-2 mb-2 inline-block"
        onMouseEnter={show}
        onMouseMove={(e) => !pinned && setTip({ x: e.clientX, y: e.clientY })}
        onMouseLeave={hide}
        onClick={(e) => { setPinned((p) => !p); setTip({ x: e.clientX, y: e.clientY }); }}
      >
        {term}
      </button>
      {tip && (
        <div
          className="xref-tooltip font-roman text-[var(--text-muted)] text-sm leading-relaxed"
          style={{
            left: Math.min(tip.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 360),
            top: Math.min(tip.y + 14, (typeof window !== 'undefined' ? window.innerHeight : 800) - 160),
          }}
        >
          <span className="block font-medieval text-[var(--ink-gold)] text-xs tracking-[0.2em] uppercase mb-1">{term}</span>
          {definition}
          {pinned && <span className="block mt-2 text-[0.65rem] text-[var(--ink-red)]/70 uppercase tracking-widest">tap term to dismiss</span>}
        </div>
      )}
    </>
  );
}

export default function ScholarMargin({ theorem, heading, continuity = null }) {
  const glossary = theorem.glossary || {};
  const glossEntries = Object.entries(glossary);
  const concordances = rankConcordances(theorem.crossReferences || [], continuity);
  const hasResonance = Number(continuity?.count) > 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[var(--ink-red)] text-sm">♦</span>
        <h4 className="font-medieval text-[var(--ink-red)] text-sm tracking-[0.2em] uppercase opacity-80">{heading}</h4>
      </div>

      <p className="font-roman text-[var(--text-muted)] text-base italic leading-relaxed opacity-90 mb-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
        “{theorem.scholium}”
      </p>

      {concordances.length > 0 && (
        <div className="mb-6">
          <h5 className="font-medieval text-[var(--ink-gold)]/80 text-[0.7rem] tracking-[0.25em] uppercase mb-3">
            Concordances{hasResonance ? <span className="ml-2 opacity-45">· resonantia</span> : null}
          </h5>
          {concordances.map((x, i) => (
            <CrossRefCard
              key={`${theorem.id}-${continuity?.mode || 'unworked'}-${x.figure}-${i}`}
              xref={x}
              defaultOpen={i === 0}
              resonant={hasResonance && i === 0}
            />
          ))}
        </div>
      )}

      {glossEntries.length > 0 && (
        <div>
          <h5 className="font-medieval text-[var(--ink-gold)]/80 text-[0.7rem] tracking-[0.25em] uppercase mb-3">Lexicon</h5>
          <div className="flex flex-wrap">
            {glossEntries.map(([term, def]) => (
              <GlossaryChip key={term} term={term} definition={def} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
