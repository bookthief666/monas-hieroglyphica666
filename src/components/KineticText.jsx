import React, { useMemo, useRef } from 'react';
import { useScrollDecrypt } from '../lib/useScrollDecrypt.js';

const CIPHER = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZΛΔΘΞΠΣΦΨΩ☿🜍☾☉🜁🜔🜃✶✷');

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function cipherGlyph(index, seed) {
  let value = (seed ^ Math.imul(index + 1, 0x45d9f3b)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x45d9f3b) >>> 0;
  value ^= value >>> 16;
  return CIPHER[value % CIPHER.length];
}

const scramble = (text, seed) =>
  Array.from(text)
    .map((character, index) => (
      character === ' ' || character === '\n' ? character : cipherGlyph(index, seed)
    ))
    .join('');

function Paragraph({ text, localThreshold, seed }) {
  const cipher = useMemo(() => scramble(text, seed), [text, seed]);
  if (localThreshold >= text.length) {
    return <span className="kinetic-revealed">{text}</span>;
  }
  if (localThreshold <= 0) {
    return <span className="kinetic-cipher">{cipher}</span>;
  }
  return (
    <>
      <span className="kinetic-revealed">{text.slice(0, localThreshold)}</span>
      <span className="kinetic-cipher">{cipher.slice(localThreshold)}</span>
    </>
  );
}

export default function KineticText({ text, variant = 'theorem', revealKey, initialReveal = 0 }) {
  const ref = useRef(null);
  const reveal = useScrollDecrypt(ref, revealKey, { initialReveal });
  const threshold = Math.round(reveal * text.length);
  const baseSeed = useMemo(() => hashString(revealKey), [revealKey]);

  if (variant === 'exegesis') {
    const paragraphs = text.split('\n\n');
    let offset = 0;
    return (
      <div ref={ref} className="text-[var(--ink-gold)] font-roman leading-[1.8] space-y-6 text-xl md:text-2xl">
        {paragraphs.map((paragraph, index) => {
          const localThreshold = threshold - offset;
          offset += paragraph.length + 2;
          return (
            <p key={index} className={index === 0 ? '' : 'mt-4'}>
              <Paragraph text={paragraph} localThreshold={localThreshold} seed={baseSeed + index * 977} />
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
        {dropRevealed ? first : cipherGlyph(0, baseSeed)}
      </span>
      <Paragraph text={rest} localThreshold={threshold - 1} seed={baseSeed + 313} />
    </div>
  );
}
