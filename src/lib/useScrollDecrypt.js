import { useEffect, useRef, useState, useCallback } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * useScrollDecrypt — the scrying engine of the kinetic typography.
 *
 * `initialReveal` is deliberately small and is used by Living Grimoire V to let
 * a theorem remember prior work: a worked Exegesis returns slightly less opaque,
 * never fully revealed and never bypassing the operator's scroll/gaze.
 */
export function useScrollDecrypt(ref, key, { initialReveal = 0, autoSeconds = 9 } = {}) {
  const baseReveal = Math.max(0, Math.min(0.35, Number(initialReveal) || 0));
  const [reveal, setReveal] = useState(baseReveal);
  const target = useRef(baseReveal);
  const current = useRef(baseReveal);
  const pointer = useRef({ x: -9999, y: -9999 });
  const mountedAt = useRef(performance.now());
  const raf = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = 1;
      target.current = 1;
      setReveal(1);
      return;
    }
    current.current = baseReveal;
    target.current = baseReveal;
    mountedAt.current = performance.now();
    setReveal(baseReveal);
  }, [key, baseReveal]);

  const recompute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const start = vh * 0.75;
    const end = vh * 0.15;
    const scrollProg = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pointer.current.x - cx;
    const dy = pointer.current.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.min(1, Math.max(0, 1 - dist / (rect.height / 2 + 340)));

    const elapsed = (performance.now() - mountedAt.current) / 1000;
    const autoProgress = Math.min(1, Math.max(0, (elapsed - 0.4) / Math.max(1, autoSeconds)));
    const autoFloor = baseReveal + (1 - baseReveal) * autoProgress;

    target.current = Math.max(baseReveal, scrollProg, proximity * 0.95, autoFloor);
  }, [ref, baseReveal, autoSeconds]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const onScroll = () => recompute();
    const onPointer = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      recompute();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    const tick = () => {
      recompute();
      const t = target.current;
      const c = current.current;
      current.current = c + (t - c) * (t > c ? 0.08 : 0.02);
      if (Math.abs(current.current - reveal) > 0.002) {
        setReveal(current.current);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recompute, key]);

  return reveal;
}

export default useScrollDecrypt;
