import React, { useRef } from 'react';
import { useScrollDecrypt } from '../lib/useScrollDecrypt.js';

// The aether-alphabet: alchemical/astrological glyphs and Greek capitals that
// the truth resolves out of. Truth is "pulled from the aether" by the operator's
// own scroll and gaze — not handed over on a timer.
const CIPHER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZΛΔΘΞΠΣΦΨΩ☿🜍☾☉🜁🜔🜃✶✷';

const scramble = (s) =>
  s
    .split('')
    .map((ch) => (ch === ' ' || ch === '\n' ? ch : CIPHER[(Math.random() * CIPHER.length) | 0]))
    .join('');

/**
 * Render one paragraph with a left-to-right reveal: a clear prefix (truth already
 * scryed) followed by a still-ciphered suffix shimmering in the aether.
 */
function Paragraph({ text, localThreshold }) {
  if (localThreshold >= text.length) {
    return <span className="kinetic-revealed">{text}</span>;
  }
  if (localThreshold <= 0) {
    return <span className="kinetic-cipher">{scramble(text)}</span>;
  }
  return (
    <>
      <span className="kinetic-revealed">{text.slice(0, localThreshold)}</span>
      <span className="kinetic-cipher">{scramble(text.slice(localThreshold))}</span>
    </>
  );
}

/**
 * KineticText — scroll/gaze-linked decrypting typography.
 *
 * @param {string} text        the truth to be revealed
 * @param {'theorem'|'exegesis'} variant
 * @param {any} revealKey      changes reset the decryption (theorem/view switch)
 */
export default function KineticText({ text, variant = 'theorem', revealKey }) {
  const ref = useRef(null);
  const reveal = useScrollDecrypt(ref, revealKey);
  const threshold = Math.round(reveal * text.length);

  if (variant === 'exegesis') {
    const paragraphs = text.split('\n\n');
    let offset = 0;
    return (
      <div ref={ref} className="text-[var(--ink-gold)] font-roman leading-[1.8] space-y-6 text-xl md:text-2xl">
        {paragraphs.map((p, idx) => {
          const localThreshold = threshold - offset;
          // +2 accounts for the consumed paragraph break in the offset accounting
          offset += p.length + 2;
          return (
            <p key={idx} className={idx === 0 ? '' : 'mt-4'}>
              <Paragraph text={p} localThreshold={localThreshold} />
            </p>
          );
        })}
      </div>
    );
  }

  // theorem variant — illuminated drop-cap on the first letter
  const first = text.charAt(0);
  const rest = text.slice(1);
  const dropRevealed = threshold >= 1;
  return (
    <div ref={ref} className="text-[#fcf8eb]">
      <span className={`drop-cap ${dropRevealed ? '' : 'kinetic-cipher'}`}>
        {dropRevealed ? first : CIPHER[(Math.random() * CIPHER.length) | 0]}
      </span>
      <Paragraph text={rest} localThreshold={threshold - 1} />
    </div>
  );
}
