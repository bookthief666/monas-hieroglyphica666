import React, { useState } from 'react';

// A single comparative cross-reference: tradition + figure as a header that
// expands to reveal the gloss connecting Dee's geometry to the wider tapestry
// of esotericism (Shaiva, Neoplatonic, non-dualist, Bataillean...).
function CrossRefCard({ xref, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-l-2 border-[var(--ink-gold)]/30 pl-3 mb-3 transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-left w-full group"
      >
        <span className="block font-medieval text-[var(--ink-red)] text-[0.7rem] tracking-[0.2em] uppercase opacity-90">
          {xref.tradition}
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

// A glossary term as a glowing chip; hovering surfaces a fixed-position scrying
// tooltip, tapping pins it (mobile-friendly).
function GlossaryChip({ term, definition }) {
  const [tip, setTip] = useState(null); // {x,y} | null
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

export default function ScholarMargin({ theorem, heading }) {
  const glossary = theorem.glossary || {};
  const glossEntries = Object.entries(glossary);
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[var(--ink-red)] text-sm">♦</span>
        <h4 className="font-medieval text-[var(--ink-red)] text-sm tracking-[0.2em] uppercase opacity-80">{heading}</h4>
      </div>

      {/* The classical scholium, kept */}
      <p className="font-roman text-[var(--text-muted)] text-base italic leading-relaxed opacity-90 mb-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
        “{theorem.scholium}”
      </p>

      {/* Comparative cross-references — the one pattern wearing many traditions */}
      {theorem.crossReferences?.length > 0 && (
        <div className="mb-6">
          <h5 className="font-medieval text-[var(--ink-gold)]/80 text-[0.7rem] tracking-[0.25em] uppercase mb-3">Concordances</h5>
          {theorem.crossReferences.map((x, i) => (
            <CrossRefCard key={i} xref={x} defaultOpen={i === 0} />
          ))}
        </div>
      )}

      {/* Lexicon — tap a term to scry its meaning */}
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
