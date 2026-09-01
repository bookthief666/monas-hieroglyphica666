import React, { useCallback, useEffect, useRef } from 'react';
import { stageForTheorem } from '../lib/stages.js';
import { theoremMemoryImprint } from '../lib/ritualContinuity.js';

// The initiatory ladder is also a memory constellation. Worked theorems retain
// only a faint aureole; there are no checks, counters, completion badges, or XP.
export default function TheoremNav({ theorems, active, onSelect, memory = null }) {
  const preloaded = useRef(new Set());
  const stageColor = {
    nigredo: 'text-[#7a6a8a]',
    albedo: 'text-[#dfe6f0]',
    rubedo: 'text-[#e8a96a]',
  };

  const preloadTheorem = useCallback((theorem) => {
    const src = theorem?.bgImage;
    if (!src || typeof window === 'undefined' || preloaded.current.has(src)) return;
    preloaded.current.add(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    image.decode?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const index = theorems.findIndex((theorem) => theorem.id === active);
    if (index < 0) return undefined;
    const warm = () => {
      preloadTheorem(theorems[index - 1]);
      preloadTheorem(theorems[index + 1]);
    };

    if ('requestIdleCallback' in window) {
      const idle = window.requestIdleCallback(warm, { timeout: 1400 });
      return () => window.cancelIdleCallback?.(idle);
    }
    const timer = window.setTimeout(warm, 450);
    return () => window.clearTimeout(timer);
  }, [active, preloadTheorem, theorems]);

  return (
    <nav className="mt-6 md:mt-12 pt-6 md:pt-8 border-t border-[#3a2e1d]/60 relative z-20 w-full overflow-hidden">
      <ul className="flex overflow-x-auto hide-scrollbar flex-nowrap items-center gap-4 md:flex-wrap md:justify-center md:gap-6 px-4 max-w-5xl mx-auto py-2">
        {theorems.map((t) => {
          const stage = stageForTheorem(t.id).id;
          const isActive = active === t.id;
          const theoremMemory = memory?.theorems?.[String(t.id)] || null;
          const imprint = theoremMemoryImprint(theoremMemory);
          const worked = imprint > 0.02;
          return (
            <li
              key={t.id}
              className={`relative group shrink-0 theorem-memory-node ${worked ? 'is-worked' : ''}`}
              style={{ '--theorem-memory-imprint': imprint.toFixed(3) }}
            >
              {worked && <span className="theorem-memory-orbit" aria-hidden="true" />}
              <button
                onClick={() => onSelect(t.id)}
                onPointerEnter={() => preloadTheorem(t)}
                onPointerDown={() => preloadTheorem(t)}
                onFocus={() => preloadTheorem(t)}
                title={`${t.title} — ${stage}${worked ? ' — residue retained' : ''}`}
                className={`font-roman font-bold text-xl md:text-2xl transition-all duration-500 ease-out w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${
                  isActive
                    ? 'glow-gold transform scale-125'
                    : `${stageColor[stage]} hover:text-[var(--ink-gold)] hover:scale-110 opacity-60 hover:opacity-100`
                }`}
              >
                {t.numeral}
              </button>
              {isActive && (
                <span className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2 text-[var(--ink-red)] text-xs md:text-sm animate-pulse opacity-80">☿</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
