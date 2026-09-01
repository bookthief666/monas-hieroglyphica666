import { useEffect, useMemo, useState } from 'react';

const hasWindow = typeof window !== 'undefined';

function query(media) {
  return hasWindow && typeof window.matchMedia === 'function'
    ? window.matchMedia(media).matches
    : false;
}

function readProfile() {
  if (!hasWindow) {
    return {
      width: 1024,
      height: 768,
      dpr: 1,
      coarsePointer: false,
      hoverNone: false,
      reducedMotion: false,
      saveData: false,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    coarsePointer: query('(pointer: coarse)'),
    hoverNone: query('(hover: none)'),
    reducedMotion: query('(prefers-reduced-motion: reduce)'),
    saveData: Boolean(navigator.connection?.saveData),
  };
}

export default function useDeviceProfile() {
  const [raw, setRaw] = useState(readProfile);

  useEffect(() => {
    if (!hasWindow) return undefined;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setRaw(readProfile()));
    };

    const media = [
      window.matchMedia?.('(pointer: coarse)'),
      window.matchMedia?.('(hover: none)'),
      window.matchMedia?.('(prefers-reduced-motion: reduce)'),
    ].filter(Boolean);

    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    media.forEach((m) => m.addEventListener?.('change', update));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      media.forEach((m) => m.removeEventListener?.('change', update));
    };
  }, []);

  return useMemo(() => {
    const compact = Math.min(raw.width, raw.height) < 430;
    const touchFirst = raw.coarsePointer || raw.hoverNone;
    const constrained = raw.reducedMotion || raw.saveData;

    let particleBudget = 450;
    if (touchFirst) particleBudget = compact ? 280 : 320;
    if (constrained) particleBudget = compact ? 190 : 240;

    return {
      ...raw,
      compact,
      touchFirst,
      constrained,
      particleBudget,
      dprCap: touchFirst ? 2 : 3,
      lineStep: touchFirst ? 8 : 5,
      lineStepJ: touchFirst ? 10 : 6,
      connectionEvery: constrained ? 4 : touchFirst ? 2 : 1,
      enableParticleGlow: !touchFirst && !raw.reducedMotion,
      enableRipples: !raw.reducedMotion,
      key: [
        compact ? 'c' : 'w',
        touchFirst ? 't' : 'f',
        raw.reducedMotion ? 'r' : 'm',
        raw.saveData ? 's' : 'n',
        Math.min(3, Math.round(raw.dpr * 2) / 2),
      ].join('-'),
    };
  }, [raw]);
}
