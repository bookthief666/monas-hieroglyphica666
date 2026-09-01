import React, { useRef } from 'react';
import { useScrollDecrypt } from '../lib/useScrollDecrypt.js';

const CIPHER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZΛΔΘΞΠΣΦΨΩ☿🜍☾☉🜁🜔🜃✶✷';

const scramble = (s) =>
  s
    .split('')
    .map((ch) => (ch === ' ' || ch === '\n' ? ch : CIPHER[(Math.random() * CIPHER.length) | 0]))
    .join('');

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

export default function KineticText({ text, variant = 'theorem', revealKey, initialReveal = 0 }) {
  const ref = useRef(null);
  const reveal = useScrollDecrypt(ref, revealKey, { initialReveal });
  const threshold = Math.round(reveal * text.length);

  if (variant === 'exegesis') {
    const paragraphs = text.split('\n\n');
    let offset = 0;
    return (
      <div ref={ref} className="text-[var(--ink-gold)] font-roman leading-[1.8] space-y-6 text-xl md:text-2xl">
        {paragraphs.map((p, idx) => {
          const localThreshold = threshold - offset;
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
