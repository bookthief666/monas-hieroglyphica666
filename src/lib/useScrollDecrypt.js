import { useEffect, useRef, useState, useCallback } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * useScrollDecrypt — the scrying engine of the kinetic typography.
 *
 * Returns a `reveal` ratio in [0,1] that the operator pulls from the aether
 * with their own body. The target reveal is the MAX of three sources, so the
 * text always resolves, but resolution feels *earned*:
 *   1. scroll progress of the article through the viewport (the descent of the gaze)
 *   2. cursor proximity to the text block (scrying — leaning into the glass)
 *   3. a slow auto-floor so reduced-motion / no-scroll readers still receive truth
 *
 * The returned value is eased per frame toward the target, so revelation breathes
 * rather than snaps. `key` resets the animation when the theorem/view changes.
 *
 * @param {React.RefObject} ref   the text container element
 * @param {any} key               changes to this reset the reveal to 0
 */
export function useScrollDecrypt(ref, key) {
  const [reveal, setReveal] = useState(0);
  const target = useRef(0);
  const current = useRef(0);
  const pointer = useRef({ x: -9999, y: -9999 });
  const mountedAt = useRef(performance.now());
  const raf = useRef(0);

  // reset on key change (new theorem / toggled view)
  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = 1;
      target.current = 1;
      setReveal(1);
      return;
    }
    current.current = 0;
    target.current = 0;
    mountedAt.current = performance.now();
    setReveal(0);
  }, [key]);

  const recompute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // 1) scroll progress: 0 when the block's top sits at 75% of the viewport,
    //    1 once it has risen to ~15% — the act of scrolling decrypts the page.
    const start = vh * 0.75;
    const end = vh * 0.15;
    const scrollProg = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

    // 2) cursor proximity: scrying. Within ~340px of the block centre the text
    //    resolves under the gaze; the closer the operator leans, the clearer it gets.
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pointer.current.x - cx;
    const dy = pointer.current.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.min(1, Math.max(0, 1 - dist / (rect.height / 2 + 340)));

    // 3) auto-floor: a gentle 9s creep so the text never stays hidden.
    const elapsed = (performance.now() - mountedAt.current) / 1000;
    const autoFloor = Math.min(1, Math.max(0, (elapsed - 0.4) / 9));

    target.current = Math.max(scrollProg, proximity * 0.95, autoFloor);
  }, [ref]);

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
      // ease current toward target (asymmetric: reveal eagerly, never un-reveal hard)
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
