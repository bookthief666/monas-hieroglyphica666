import React, { useCallback, useEffect, useRef, useState } from 'react';
import { stageForTheorem } from '../lib/stages.js';
import { theoremMemoryImprint } from '../lib/ritualContinuity.js';
import '../release-polish.css';

// The initiatory ladder is also a memory constellation. Worked theorems retain
// only a faint aureole; there are no checks, counters, completion badges, or XP.
export default function TheoremNav({ theorems, active, onSelect, memory = null }) {
  const preloaded = useRef(new Set());
  const railRef = useRef(null);
  const [railState, setRailState] = useState({ canLeft: false, canRight: false });
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

  const syncRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const next = {
      canLeft: rail.scrollLeft > 8,
      canRight: rail.scrollLeft < maxScroll - 8,
    };
    setRailState((previous) => (
      previous.canLeft === next.canLeft && previous.canRight === next.canRight ? previous : next
    ));
  }, []);

  const scrollRail = useCallback((direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({
      left: direction * Math.max(190, rail.clientWidth * 0.72),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;

    const frame = window.requestAnimationFrame(syncRailState);
    const onResize = () => window.requestAnimationFrame(syncRailState);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [syncRailState, theorems.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const rail = railRef.current;
    const target = rail?.querySelector(`[data-theorem-id="${active}"]`);
    if (!rail || !target) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const railRect = rail.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const desired = rail.scrollLeft
      + (targetRect.left - railRect.left)
      - (rail.clientWidth - targetRect.width) / 2;
    rail.scrollTo({
      left: Math.max(0, desired),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    const timer = window.setTimeout(syncRailState, reduceMotion ? 0 : 320);
    return () => window.clearTimeout(timer);
  }, [active, syncRailState]);

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
    <nav
      className="theorem-rail mt-6 md:mt-12 pt-6 md:pt-8 border-t border-[#3a2e1d]/60 relative z-20 w-full"
      aria-label="Theorem ladder"
    >
      <div className="theorem-rail-heading">
        <span className="theorem-rail-kicker">Theorem Ladder · I—XXIV</span>
        <span className="theorem-rail-hint" aria-hidden="true">Tap a numeral · swipe to continue →</span>
      </div>

      <div className="theorem-rail-shell">
        <span className={`theorem-rail-fade theorem-rail-fade-left ${railState.canLeft ? 'is-visible' : ''}`} aria-hidden="true" />
        <span className={`theorem-rail-fade theorem-rail-fade-right ${railState.canRight ? 'is-visible' : ''}`} aria-hidden="true" />

        {railState.canLeft && (
          <button
            type="button"
            className="theorem-rail-control theorem-rail-control-left"
            onClick={() => scrollRail(-1)}
            aria-label="Scroll to earlier theorems"
          >
            ‹
          </button>
        )}
        {railState.canRight && (
          <button
            type="button"
            className="theorem-rail-control theorem-rail-control-right"
            onClick={() => scrollRail(1)}
            aria-label="Scroll to later theorems"
          >
            ›
          </button>
        )}

        <ul
          ref={railRef}
          onScroll={syncRailState}
          className="theorem-rail-list flex overflow-x-auto flex-nowrap items-center gap-3 md:flex-wrap md:justify-center md:gap-6 max-w-5xl mx-auto py-2"
          aria-label="Theorems I through XXIV"
        >
          {theorems.map((t) => {
            const stage = stageForTheorem(t.id).id;
            const isActive = active === t.id;
            const theoremMemory = memory?.theorems?.[String(t.id)] || null;
            const imprint = theoremMemoryImprint(theoremMemory);
            const worked = imprint > 0.02;
            return (
              <li
                key={t.id}
                data-theorem-id={t.id}
                className={`theorem-rail-node relative group shrink-0 theorem-memory-node ${worked ? 'is-worked' : ''} ${isActive ? 'theorem-rail-current' : ''}`}
                style={{ '--theorem-memory-imprint': imprint.toFixed(3) }}
              >
                {worked && <span className="theorem-memory-orbit" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  onPointerEnter={() => preloadTheorem(t)}
                  onPointerDown={() => preloadTheorem(t)}
                  onFocus={() => preloadTheorem(t)}
                  title={`${t.title} — ${stage}${worked ? ' — residue retained' : ''}`}
                  aria-label={`Open Theorem ${t.numeral}: ${t.title}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-roman font-bold text-xl md:text-2xl transition-all duration-500 ease-out w-11 h-11 md:w-12 md:h-12 flex items-center justify-center ${
                    isActive
                      ? 'glow-gold transform scale-125'
                      : `${stageColor[stage]} hover:text-[var(--ink-gold)] hover:scale-110 opacity-60 hover:opacity-100`
                  }`}
                >
                  {t.numeral}
                </button>
                {isActive && (
                  <span className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2 text-[var(--ink-red)] text-xs md:text-sm animate-pulse opacity-80" aria-hidden="true">☿</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
