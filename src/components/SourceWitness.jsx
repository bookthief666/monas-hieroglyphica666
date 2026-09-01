import React from 'react';
import { getSourceWitness } from '../lib/sourceWitness.js';

export default function SourceWitness({ theorem }) {
  const witness = getSourceWitness(theorem?.id);

  return (
    <aside className="source-witness w-full max-w-3xl mt-8 md:mt-10" aria-label={`1564 source witness for ${theorem?.title || 'theorem'}`}>
      <div className="source-witness-rule" aria-hidden="true" />
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="font-medieval text-[0.64rem] md:text-xs tracking-[0.28em] uppercase text-[var(--ink-gold)] opacity-80">
          Textus · 1564 Witness
        </span>
        <span className="font-roman text-[0.68rem] tracking-[0.16em] uppercase text-[var(--text-muted)] opacity-55">
          Theorema {theorem?.numeral || witness.theoremId}
        </span>
      </div>

      <p className="source-witness-latin font-roman italic text-base md:text-lg leading-relaxed text-[var(--ink-gold)]/90">
        {witness.latinIncipit}
      </p>

      <details className="source-witness-details mt-4">
        <summary className="font-medieval text-[0.68rem] md:text-xs tracking-[0.18em] uppercase text-[var(--text-muted)] cursor-pointer select-none">
          Source & translation witness
        </summary>
        <div className="source-witness-meta mt-4 grid gap-3 text-sm md:text-base font-roman leading-relaxed text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--ink-gold)]">Primary witness · </span>
            {witness.author}, <em>{witness.title}</em>, {witness.place}, {witness.printer}, {witness.year}.
          </p>
          <p>
            <span className="text-[var(--ink-gold)]">Transcription · </span>
            {witness.transcriptionNote}
          </p>
          <p>
            <span className="text-[var(--ink-gold)]">English · </span>
            {witness.englishLabel}. Translation reference: {witness.translationReference}.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            <a
              href={witness.facsimileUrl}
              target="_blank"
              rel="noreferrer"
              className="source-witness-link font-medieval text-xs tracking-[0.14em] uppercase text-[var(--ink-gold)]"
            >
              Open 1564 facsimile ↗
            </a>
            <a
              href={witness.catalogueUrl}
              target="_blank"
              rel="noreferrer"
              className="source-witness-link font-medieval text-xs tracking-[0.14em] uppercase text-[var(--ink-gold)]"
            >
              Library record ↗
            </a>
            <a
              href={witness.translationReferenceUrl}
              target="_blank"
              rel="noreferrer"
              className="source-witness-link font-medieval text-xs tracking-[0.14em] uppercase text-[var(--ink-gold)]"
            >
              Translation reference ↗
            </a>
          </div>
        </div>
      </details>
    </aside>
  );
}
