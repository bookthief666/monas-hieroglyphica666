import React, { forwardRef } from 'react';

const AUDIO_SRC =
  'https://raw.githubusercontent.com/bookthief666/monas-hieroglyphica/eae983cd6e2effee405668628f7031f8f5f7976a/Ryuichi%20Sakamoto%20-%20Bibo%20No%20Aozora.mp3';

// Root-level audio so navigating theorems never unmounts/restarts the music.
export const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  return <audio ref={ref} src={AUDIO_SRC} loop preload="auto" />;
});

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
