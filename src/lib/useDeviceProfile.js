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
      hardwareConcurrency: 8,
      deviceMemory: 8,
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
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
    deviceMemory: navigator.deviceMemory || 8,
  };
}

function capabilitySignature(raw) {
  const shortSide = Math.min(raw.width, raw.height);
  const sizeBand = shortSide < 430 ? 'compact' : shortSide < 520 ? 'narrow' : 'wide';
  const touchFirst = raw.coarsePointer || raw.hoverNone;
  const lowCpu = raw.hardwareConcurrency <= 4;
  const lowMemory = raw.deviceMemory <= 4;
  const dprBand = Math.min(3, Math.round(raw.dpr * 2) / 2);
  return [
    sizeBand,
    touchFirst ? 'touch' : 'fine',
    raw.reducedMotion ? 'reduce' : 'motion',
    raw.saveData ? 'save' : 'data',
    lowCpu ? 'lowcpu' : 'cpu',
    lowMemory ? 'lowmem' : 'mem',
    dprBand,
  ].join('|');
}

export default function useDeviceProfile() {
  const [raw, setRaw] = useState(readProfile);

  useEffect(() => {
    if (!hasWindow) return undefined;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = readProfile();
        setRaw((previous) => (
          capabilitySignature(previous) === capabilitySignature(next) ? previous : next
        ));
      });
    };

    const media = [
      window.matchMedia?.('(pointer: coarse)'),
      window.matchMedia?.('(hover: none)'),
      window.matchMedia?.('(prefers-reduced-motion: reduce)'),
    ].filter(Boolean);

    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    media.forEach((m) => m.addEventListener?.('change', update));
    navigator.connection?.addEventListener?.('change', update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      media.forEach((m) => m.removeEventListener?.('change', update));
      navigator.connection?.removeEventListener?.('change', update);
    };
  }, []);

  return useMemo(() => {
    const shortSide = Math.min(raw.width, raw.height);
    const compact = shortSide < 430;
    const narrow = shortSide < 520;
    const touchFirst = raw.coarsePointer || raw.hoverNone;
    const lowCpu = raw.hardwareConcurrency <= 4;
    const lowMemory = raw.deviceMemory <= 4;
    const constrained = raw.reducedMotion || raw.saveData || (lowCpu && lowMemory);

    let particleBudget = 470;
    if (touchFirst) particleBudget = compact ? 285 : narrow ? 320 : 350;
    if (lowCpu || lowMemory) particleBudget = Math.min(particleBudget, touchFirst ? 275 : 390);
    if (constrained) particleBudget = compact ? 190 : 235;

    const dprCap = constrained ? 1.5 : touchFirst ? 2 : 3;
    const skeletonSamples = constrained ? 168 : touchFirst ? 224 : 320;
    const sparkBudget = constrained ? 8 : touchFirst ? 16 : 24;

    return {
      ...raw,
      compact,
      narrow,
      touchFirst,
      lowCpu,
      lowMemory,
      constrained,
      particleBudget,
      dprCap,
      skeletonSamples,
      sparkBudget,
      lineStep: constrained ? 10 : touchFirst ? 8 : 5,
      lineStepJ: constrained ? 12 : touchFirst ? 10 : 6,
      connectionEvery: constrained ? 4 : touchFirst ? 2 : 1,
      enableParticleGlow: !touchFirst && !raw.reducedMotion,
      enableRipples: !raw.reducedMotion,
      key: [
        compact ? 'c' : narrow ? 'n' : 'w',
        touchFirst ? 't' : 'f',
        raw.reducedMotion ? 'r' : 'm',
        raw.saveData ? 's' : 'n',
        lowCpu ? 'lc' : 'hc',
        lowMemory ? 'lm' : 'hm',
        Math.min(3, Math.round(raw.dpr * 2) / 2),
      ].join('-'),
    };
  }, [raw]);
}
