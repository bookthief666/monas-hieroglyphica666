import { useEffect, useRef, useState, useCallback } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * useScrollDecrypt — the scrying engine of the kinetic typography.
 *
 * `initialReveal` is deliberately small and is used by Living Grimoire V to let
 * a theorem remember prior work: a worked Exegesis returns slightly less opaque,
 * never fully revealed and never bypassing the operator's scroll/gaze.
 *
 * The reveal is monotonic for one mounted register: once a character has been
 * deciphered it does not re-encrypt when the pointer moves away. DOM geometry is
 * sampled only in response to scroll/pointer/resize, rather than every animation
 * frame, and React publication is capped to roughly 30 Hz.
 */
export function useScrollDecrypt(ref, key, { initialReveal = 0, autoSeconds = 9 } = {}) {
  const baseReveal = Math.max(0, Math.min(0.35, Number(initialReveal) || 0));
  const [reveal, setReveal] = useState(baseReveal);
  const target = useRef(baseReveal);
  const current = useRef(baseReveal);
  const published = useRef(baseReveal);
  const pointer = useRef({ x: -9999, y: -9999 });
  const mountedAt = useRef(nowMs());
  const raf = useRef(0);
  const sampleRaf = useRef(0);
  const lastPublishedAt = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = 1;
      target.current = 1;
      published.current = 1;
      setReveal(1);
      return;
    }
    current.current = baseReveal;
    target.current = baseReveal;
    published.current = baseReveal;
    mountedAt.current = nowMs();
    lastPublishedAt.current = 0;
    setReveal(baseReveal);
  }, [key, baseReveal]);

  const recompute = useCallback(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
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

    target.current = Math.max(target.current, baseReveal, scrollProg, proximity * 0.95);
  }, [ref, baseReveal]);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const requestSample = () => {
      cancelAnimationFrame(sampleRaf.current);
      sampleRaf.current = requestAnimationFrame(recompute);
    };

    const onScroll = () => requestSample();
    const onPointer = (event) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      requestSample();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    recompute();

    const tick = (now) => {
      const elapsed = (now - mountedAt.current) / 1000;
      const autoProgress = Math.min(1, Math.max(0, (elapsed - 0.4) / Math.max(1, autoSeconds)));
      const autoFloor = baseReveal + (1 - baseReveal) * autoProgress;
      target.current = Math.max(target.current, autoFloor);

      const t = target.current;
      const c = current.current;
      current.current = c + (t - c) * 0.08;

      const settled = current.current > 0.998 && t > 0.998;
      const publishDelta = Math.abs(current.current - published.current);
      if (settled || (publishDelta > 0.006 && now - lastPublishedAt.current >= 33)) {
        const next = settled ? 1 : current.current;
        published.current = next;
        lastPublishedAt.current = now;
        setReveal(next);
      }

      if (settled) {
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(sampleRaf.current);
    };
  }, [recompute, key, autoSeconds, baseReveal]);

  return reveal;
}

export default useScrollDecrypt;
