import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import RitualProjection from './RitualProjection.jsx';
import { getProjectionSpec } from '../lib/projectionSpec.js';
import useMirrorRitual from '../lib/useMirrorRitual.js';
import { initialAnatomiaOffsets } from '../lib/ritualContinuity.js';

const VIEW = 240;
const CENTER = VIEW / 2;

const PARTS = [
  { id: 'luna', label: 'Luna ☾', home: [CENTER, 56], weight: 63 },
  { id: 'sol', label: 'Sol ☉', home: [CENTER, 104], weight: 63 },
  { id: 'crux', label: 'Crux ✚', home: [CENTER, 168], weight: 63 },
  { id: 'aries', label: 'Aries ♈', home: [CENTER, 210], weight: 63 },
];

function MemberShape({ id, color }) {
  switch (id) {
    case 'luna':
      return <path d="M -22,0 A 22,22 0 1,0 22,0 A 14,14 0 1,1 -22,0" fill="none" stroke={color} strokeWidth="2.5" />;
    case 'sol':
      return (
        <>
          <circle cx="0" cy="0" r="24" fill="none" stroke={color} strokeWidth="2.5" />
          <circle cx="0" cy="0" r="3.5" fill={color} />
        </>
      );
    case 'crux':
      return (
        <>
          <line x1="0" y1="-30" x2="0" y2="30" stroke={color} strokeWidth="2.5" />
          <line x1="-22" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
        </>
      );
    case 'aries':
      return (
        <>
          <path d="M 0,14 A 12,12 0 0,1 24,14" fill="none" stroke={color} strokeWidth="2.5" />
          <path d="M 0,14 A 12,12 0 0,0 -24,14" fill="none" stroke={color} strokeWidth="2.5" />
        </>
      );
    default:
      return null;
  }
}

export default function Deconstructor({ palette, insight, theoremId = 13 }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const dragFrame = useRef(0);
  const dragDelta = useRef({ x: 0, y: 0 });
  const crownedRef = useRef(null);
  const projection = getProjectionSpec(theoremId);
  const ritual = useMirrorRitual(theoremId);
  const { lastOperation, memoryCount, continuity } = ritual;
  const [offsets, setOffsets] = useState(() => initialAnatomiaOffsets(theoremId, continuity));

  const c0 = (palette && palette[0]) || '#ffdf73';
  const c2 = (palette && palette[2]) || '#ff4444';

  const coherence = useMemo(() => {
    let disp = 0;
    for (const p of PARTS) {
      const [dx, dy] = offsets[p.id];
      disp += Math.sqrt(dx * dx + dy * dy);
    }
    const maxDisp = PARTS.length * 90;
    return Math.max(0, Math.min(1, 1 - disp / maxDisp));
  }, [offsets]);

  const crowned = coherence > 0.985;
  const pondus = 252;
  const latentCharge = Math.max(continuity.imprint, crowned ? 1 : Math.max(0, coherence - 0.72) * 0.8);

  useEffect(() => {
    if (crownedRef.current === null) {
      crownedRef.current = crowned;
      return;
    }
    if (crowned && !crownedRef.current && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('monas:anatomia-crowned', {
        detail: {
          theoremId,
          charge: Math.max(continuity.registerResonance, 0.35),
          mode: continuity.mode,
          direction: continuity.direction,
          tone: ritual.theoremMemory?.lastTone || lastOperation?.tone || null,
        },
      }));
    }
    crownedRef.current = crowned;
  }, [crowned, continuity, lastOperation, ritual.theoremMemory, theoremId]);

  const applyDragDelta = useCallback((id, ddx, ddy) => {
    if (!id || (Math.abs(ddx) < 0.001 && Math.abs(ddy) < 0.001)) return;
    setOffsets((prev) => {
      const [ox, oy] = prev[id];
      const nx = Math.max(-CENTER + 30, Math.min(CENTER - 30, ox + ddx));
      const ny = Math.max(-CENTER + 30, Math.min(CENTER - 30, oy + ddy));
      if (nx === ox && ny === oy) return prev;
      return { ...prev, [id]: [nx, ny] };
    });
  }, []);

  const flushDrag = useCallback(() => {
    if (dragFrame.current) cancelAnimationFrame(dragFrame.current);
    dragFrame.current = 0;
    const active = drag.current;
    const pending = dragDelta.current;
    dragDelta.current = { x: 0, y: 0 };
    if (!active) return;
    applyDragDelta(active.id, pending.x, pending.y);
  }, [applyDragDelta]);

  useEffect(() => () => {
    cancelAnimationFrame(dragFrame.current);
  }, []);

  const onPointerDown = (id) => (event) => {
    event.stopPropagation();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = VIEW / rect.width;
    dragDelta.current = { x: 0, y: 0 };
    drag.current = {
      id,
      left: rect.left,
      top: rect.top,
      ratio,
      lastX: (event.clientX - rect.left) * ratio,
      lastY: (event.clientY - rect.top) * ratio,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const active = drag.current;
    if (!active) return;
    const x = (event.clientX - active.left) * active.ratio;
    const y = (event.clientY - active.top) * active.ratio;
    dragDelta.current.x += x - active.lastX;
    dragDelta.current.y += y - active.lastY;
    active.lastX = x;
    active.lastY = y;
    if (!dragFrame.current) dragFrame.current = requestAnimationFrame(flushDrag);
  };

  const onPointerUp = () => {
    flushDrag();
    drag.current = null;
  };

  const recombine = () => setOffsets(Object.fromEntries(PARTS.map((p) => [p.id, [0, 0]])));
  const disperse = () => {
    const ring = [[-70, -40], [70, -40], [-70, 60], [70, 60]];
    setOffsets(Object.fromEntries(PARTS.map((p, i) => [p.id, ring[i]])));
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col items-center ritual-register-received"
      style={{ '--ritual-register-charge': continuity.registerResonance }}
    >
      <p className="font-medieval text-center text-[var(--ink-red)] text-sm tracking-[0.3em] uppercase mb-2 opacity-80">
        Anatomia Monadis — dissect and recompose the glyph
      </p>
      <p className="font-roman text-center text-[var(--text-muted)] text-base italic mb-6 max-w-xl">
        Drag the four members apart, then draw them home. The mass is conserved; only the <span className="text-[var(--ink-gold)]">coherence</span> transforms.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
        <div className="relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] shrink-0">
          <div className="absolute inset-[16%] z-20 pointer-events-none mix-blend-screen" aria-hidden="true">
            <RitualProjection
              kind={projection.operative}
              variant="operative"
              charge={latentCharge}
              memoryCount={memoryCount}
              className="w-full h-full"
            />
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="relative z-10 w-full h-full touch-none select-none rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(10,5,2,0.9) 0%, rgba(0,0,0,1) 100%)',
              border: `2px solid ${crowned ? c0 : 'rgba(212,175,55,0.35)'}`,
              boxShadow: crowned
                ? `inset 0 0 50px rgba(0,0,0,0.8), 0 0 45px ${c0}`
                : 'inset 0 0 50px rgba(0,0,0,0.9), 0 0 25px rgba(212,175,55,0.2)',
              transition: 'box-shadow 0.6s ease, border-color 0.6s ease',
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {PARTS.map((p) => {
              const [dx, dy] = offsets[p.id];
              return (
                <line
                  key={`bind-${p.id}`}
                  x1={CENTER} y1={CENTER}
                  x2={p.home[0] + dx} y2={p.home[1] + dy}
                  stroke={c2}
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                  opacity={0.4}
                />
              );
            })}
            <circle cx={CENTER} cy={CENTER} r="2.5" fill={c0} opacity={0.8} />

            {PARTS.map((p) => {
              const [dx, dy] = offsets[p.id];
              return (
                <g
                  key={p.id}
                  transform={`translate(${p.home[0] + dx}, ${p.home[1] + dy})`}
                  onPointerDown={onPointerDown(p.id)}
                  style={{ cursor: 'grab', filter: `drop-shadow(0 0 6px ${c0})` }}
                >
                  <circle cx="0" cy="0" r="30" fill="transparent" />
                  <MemberShape id={p.id} color={crowned ? c0 : c2} />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="text-center md:text-left min-w-[180px]">
          <div className="mb-4">
            <span className="font-medieval text-[var(--text-muted)] text-xs tracking-[0.25em] uppercase block">Pondus (mass)</span>
            <span className="font-blackletter text-4xl glow-gold">{pondus}</span>
          </div>
          <div className="mb-6">
            <span className="font-medieval text-[var(--text-muted)] text-xs tracking-[0.25em] uppercase block">Coherentia</span>
            <span className={`font-blackletter text-4xl ${crowned ? 'glow-gold' : 'glow-red'}`}>{Math.round(coherence * 100)}%</span>
            <div className="w-full h-1 bg-black/60 mt-2 rounded">
              <div className="h-1 rounded transition-all" style={{ width: `${coherence * 100}%`, background: crowned ? c0 : c2 }} />
            </div>
          </div>
          {crowned && (
            <p className="font-script text-[var(--ink-gold)] text-xl glow-gold mb-4 animate-pulse">Lapis Coronatus — the Stone is crowned.</p>
          )}
          {memoryCount > 0 && (
            <p className="font-medieval text-[var(--ink-gold)] text-[0.65rem] tracking-[0.2em] uppercase opacity-60 mb-4">
              Vestigium · {continuity.label}
            </p>
          )}
          <div className="flex gap-3 justify-center md:justify-start">
            <button onClick={disperse} className="font-medieval text-xs tracking-widest uppercase border border-[var(--ink-red)]/50 text-[var(--ink-red)] px-4 py-2 rounded hover:bg-[var(--ink-red)] hover:text-black transition-all">Solve</button>
            <button onClick={recombine} className="font-medieval text-xs tracking-widest uppercase border border-[var(--ink-gold)]/50 text-[var(--ink-gold)] px-4 py-2 rounded hover:bg-[var(--ink-gold)] hover:text-black transition-all">Coagula</button>
          </div>
        </div>
      </div>

      {insight && (
        <p className="font-roman text-[var(--text-muted)] text-base md:text-lg italic leading-relaxed mt-8 max-w-2xl text-center opacity-90 border-t border-[#3a2e1d]/40 pt-6">
          {insight}
        </p>
      )}
    </div>
  );
}
