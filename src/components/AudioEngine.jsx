import React, { forwardRef, useEffect, useRef } from 'react';

const AUDIO_SRC =
  'https://raw.githubusercontent.com/bookthief666/monas-hieroglyphica/eae983cd6e2effee405668628f7031f8f5f7976a/Ryuichi%20Sakamoto%20-%20Bibo%20No%20Aozora.mp3';

// Root-level audio so navigating theorems never unmounts/restarts the music.
export const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  return <audio ref={ref} src={AUDIO_SRC} loop preload="auto" />;
});

const FIELD_RATIOS = Object.freeze({
  radial: 1.5,
  seed: 2,
  solar: 1.5,
  lunar: 4 / 3,
  axial: 2,
  lattice: 3 / 2,
  stellar: 5 / 4,
  vortex: 7 / 4,
  harmonic: 3 / 2,
  polyhedral: 4 / 3,
  toroidal: 3 / 2,
  yantric: 5 / 4,
  monadic: 2,
  egg: 4 / 3,
  sephirothic: 3 / 2,
  radiant: 2,
  hypercube: Math.SQRT2,
  spiral: 7 / 4,
});

const FIELD_WAVES = Object.freeze({
  radial: 'sine', seed: 'sine', solar: 'triangle', lunar: 'sine', axial: 'triangle',
  lattice: 'sine', stellar: 'triangle', vortex: 'sine', harmonic: 'sine',
  polyhedral: 'triangle', toroidal: 'sine', yantric: 'triangle', monadic: 'sine',
  egg: 'sine', sephirothic: 'sine', radiant: 'triangle', hypercube: 'sine', spiral: 'sine',
});

// A deliberately quiet, generated resonance layer. It only speaks when a mirror
// operation resolves; there is no continuous game-like sonification.
export function RitualResonance({ muted }) {
  const contextRef = useRef(null);

  useEffect(() => {
    const onOperation = (event) => {
      if (muted || typeof window === 'undefined') return;
      const detail = event?.detail;
      if (!detail) return;

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;

      let context = contextRef.current;
      if (!context || context.state === 'closed') {
        context = new AudioContextCtor();
        contextRef.current = context;
      }
      if (context.state === 'suspended') context.resume().catch(() => {});

      const charge = Math.max(0, Math.min(1, Number(detail.charge) || 0));
      const direction = Math.max(-1, Math.min(1, Number(detail.direction) || 0));
      const root = Math.max(48, Number(detail.tone?.rootHz) || 110);
      const theoremRatio = Math.max(0.5, Number(detail.tone?.ratio) || 1);
      const fieldRatio = FIELD_RATIOS[detail.field] || 1.5;
      const wave = FIELD_WAVES[detail.field] || 'sine';
      const now = context.currentTime;
      const duration = 1.15 + charge * 0.9;
      const peak = 0.012 + charge * 0.026;

      const master = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(4200, root * 10), now);
      filter.Q.setValueAtTime(0.7 + charge * 1.2, now);
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(peak, now + 0.035);
      master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      master.connect(filter);
      filter.connect(context.destination);

      const frequencies = [root * theoremRatio, root * theoremRatio * fieldRatio];
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const partialGain = context.createGain();
        oscillator.type = index === 0 ? wave : 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.detune.setValueAtTime(direction * (index === 0 ? 5 : -7), now);
        partialGain.gain.setValueAtTime(index === 0 ? 0.8 : 0.36 + charge * 0.12, now);
        oscillator.connect(partialGain);
        partialGain.connect(master);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.06);
      });
    };

    window.addEventListener('monas:mirror-operation', onOperation);
    return () => {
      window.removeEventListener('monas:mirror-operation', onOperation);
      const context = contextRef.current;
      contextRef.current = null;
      if (context && context.state !== 'closed') context.close().catch(() => {});
    };
  }, [muted]);

  return null;
}

export function MuteButton({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-3 rounded-full border border-[var(--ink-gold)]/40 bg-[#050403]/80 text-[var(--ink-gold)] hover:bg-[var(--ink-gold)] hover:text-black transition-all shadow-[0_0_10px_rgba(255,223,115,0.3)] backdrop-blur-md"
      title={muted ? 'Unmute the spheres' : 'Silence the spheres'}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
    >
      {muted ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
      )}
    </button>
  );
}

export default AudioEngine;
