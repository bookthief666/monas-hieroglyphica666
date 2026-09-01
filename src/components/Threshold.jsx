import React from 'react';
import { THEOREMS } from '../data/theorems.js';
import RitualProjection from './RitualProjection.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';
import { returningWorkState } from '../lib/ritualContinuity.js';

// The entry gate remains an invocation of will, but a grimoire that has already
// been worked should not pretend to be untouched. Prior operations appear only as
// a residual geometry and a changed invitation — never as progress statistics.
export default function Threshold({ onEnter, memory = null }) {
  const returnState = returningWorkState(memory);
  const lastTheorem = THEOREMS.find((theorem) => theorem.id === returnState.theoremId) || THEOREMS[0];
  const projection = getProjectionSpec(returnState.theoremId);

  return (
    <div className="min-h-screen bg-[#050403] flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
        style={{ backgroundImage: "url('https://raw.githubusercontent.com/bookthief666/monas-hieroglyphica/8ce28cd62ba09c5211c5739407a85b0d16937200/Titleimage.jpg')" }}
      />

      {returnState.returning && (
        <div className="threshold-memory-projection" aria-hidden="true">
          <RitualProjection
            kind={projection.echo}
            variant="apparition"
            charge={Math.max(0.26, returnState.imprint * 0.72)}
            memoryCount={1}
            className="w-full h-full"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center p-6 text-center">
        <div className={`sigil-container mb-12 ${returnState.returning ? 'threshold-sigil-returning' : ''}`}>
          <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 text-[var(--ink-red)]" style={{ animation: 'holo-spin-3d 10s infinite linear, neon-flicker-intense 2s infinite', overflow: 'visible' }}>
            <g style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
              <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" strokeWidth="1.5" />
              <line x1="85" y1="15" x2="65" y2="35" stroke="currentColor" strokeWidth="1.5" />
              <line x1="15" y1="85" x2="35" y2="65" stroke="currentColor" strokeWidth="1.5" />
              <line x1="85" y1="85" x2="65" y2="65" stroke="currentColor" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {returnState.returning && (
          <p className="font-medieval text-[0.65rem] md:text-xs tracking-[0.3em] uppercase text-[var(--ink-gold)] opacity-70 mb-4">
            Vestigium · {lastTheorem.title} · {returnState.label}
          </p>
        )}

        <h1 className="font-blackletter text-5xl md:text-7xl mb-8 tracking-widest text-[var(--ink-red)] drop-shadow-[0_0_20px_rgba(255,68,68,0.9)] animate-pulse">Monas Hieroglyphica</h1>
        <p className="font-medieval text-lg md:text-xl text-[#e6dfcd] mb-12 max-w-xl px-4 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
          {returnState.returning
            ? 'The stone has not forgotten the last operation. Cross the threshold again and the Work resumes where its residue remains.'
            : 'The Kabbalah of Being requires an invocation of will. Cross the threshold to align the celestial frequencies, and let the geometry attend to your gaze.'}
        </p>
        <button
          onClick={onEnter}
          className="border border-[var(--ink-red)] bg-[#050403]/80 text-[var(--ink-red)] font-roman text-xl px-10 py-4 uppercase tracking-widest hover:bg-[var(--ink-red)] hover:text-[#050403] transition-all duration-300 shadow-[0_0_25px_rgba(255,68,68,0.6)] backdrop-blur-md cursor-pointer"
        >
          {returnState.returning ? 'Re-enter the Work' : 'Initiate Scrying'}
        </button>
      </div>
    </div>
  );
}
