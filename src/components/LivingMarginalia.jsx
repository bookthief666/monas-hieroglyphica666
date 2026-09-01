import React from 'react';
import { getProjectionSpec } from '../lib/projectionSpec.js';

const BASE_GLYPHS = Object.freeze(['☉', '☾', '☿', '♈', '✶', '✧', '△', '□', '◯', '✚', '🜂', '🜄', '🜁', '🜃']);

const KIND_GLYPHS = Object.freeze({
  'axis-cross': '✚',
  vesica: '◒',
  hexagram: '✶',
  radiance: '☉',
  hypercube: '⧈',
  metatron: '✥',
  icosahedron: '◇',
  torus: '⊙',
  yantra: '△',
  pentagram: '☆',
  'heptadic-rays': '✷',
  sephiroth: '✦',
  spiral: '↻',
  egg: '◯',
  mercurial: '☿',
  'four-elements': '🜁',
  'square-circle': '□',
  tetractys: '∴',
});

const STAGE_GLYPHS = Object.freeze({
  nigredo: ['🜃', '♄', '●'],
  albedo: ['☾', '🜄', '○'],
  rubedo: ['☉', '🜂', '✶'],
});

export default function LivingMarginalia({ theoremId, stage = 'nigredo', viewMode = 'theorem' }) {
  const projection = getProjectionSpec(theoremId);
  const stageGlyphs = STAGE_GLYPHS[stage] || STAGE_GLYPHS.nigredo;
  const symbols = [
    KIND_GLYPHS[projection.echo] || '✧',
    KIND_GLYPHS[projection.operative] || '✶',
    ...stageGlyphs,
    ...BASE_GLYPHS,
  ].slice(0, 12);

  return (
    <div
      className={`living-marginalia living-marginalia-${stage} living-marginalia-view-${viewMode}`}
      data-theorem={theoremId}
      aria-hidden="true"
    >
      {symbols.map((symbol, index) => {
        const left = 4 + ((index * 31 + theoremId * 7) % 91);
        const top = 7 + ((index * 43 + theoremId * 11) % 84);
        const duration = 18 + (index % 5) * 5;
        const delay = -(index * 1.7 + (theoremId % 5));
        const scale = 0.82 + (index % 4) * 0.14;
        return (
          <span
            key={`${theoremId}-${viewMode}-${symbol}-${index}`}
            className="marginalia-rune"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              '--marginalia-scale': scale,
            }}
          >
            {symbol}
          </span>
        );
      })}
    </div>
  );
}
