import React from 'react';
import { getProjectionSpec } from '../lib/projectionSpec.js';

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function polar(radius, index, count, rotation = -Math.PI / 2) {
  const angle = rotation + (index / count) * TAU;
  return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
}

function pointsString(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}

function ProjectionGeometry({ kind }) {
  switch (kind) {
    case 'axis-cross':
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </g>
      );
    case 'vesica':
      return (
        <g className="sigil-flat-group">
          <circle cx="36" cy="50" r="29" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="64" cy="50" r="29" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </g>
      );
    case 'hexagram': {
      const up = [[50, 10], [86, 72], [14, 72]];
      const down = [[50, 90], [86, 28], [14, 28]];
      return (
        <g className="sigil-flat-group">
          <polygon points={pointsString(up)} fill="none" stroke="currentColor" strokeWidth="1.3" />
          <polygon points={pointsString(down)} fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </g>
      );
    }
    case 'radiance':
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="5" fill="currentColor" />
          {Array.from({ length: 24 }, (_, i) => {
            const [x1, y1] = polar(10, i, 24);
            const [x2, y2] = polar(i % 2 === 0 ? 45 : 29, i, 24);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 2 === 0 ? 1.1 : 0.65} />;
          })}
        </g>
      );
    case 'hypercube':
      return (
        <g className="sigil-3d-group">
          <rect x="12" y="12" width="76" height="76" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="33" y="27" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.4" />
          {[[12,12,33,27],[88,12,75,27],[88,88,75,69],[12,88,33,69]].map((p, i) => (
            <line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} stroke="currentColor" strokeWidth="0.9" />
          ))}
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </g>
      );
    case 'metatron': {
      const ring = Array.from({ length: 6 }, (_, i) => polar(25, i, 6));
      const outer = Array.from({ length: 6 }, (_, i) => polar(42, i, 6));
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {ring.map(([x, y], i) => <circle key={`r${i}`} cx={x} cy={y} r="10" fill="none" stroke="currentColor" strokeWidth="0.7" />)}
          {outer.map(([x, y], i) => <circle key={`o${i}`} cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />)}
          {ring.map(([x, y], i) => <line key={`l${i}`} x1="50" y1="50" x2={x} y2={y} stroke="currentColor" strokeWidth="0.55" />)}
          {ring.map(([x, y], i) => <line key={`m${i}`} x1={x} y1={y} x2={outer[(i + 1) % 6][0]} y2={outer[(i + 1) % 6][1]} stroke="currentColor" strokeWidth="0.45" />)}
        </g>
      );
    }
    case 'icosahedron': {
      const ringA = Array.from({ length: 5 }, (_, i) => polar(31, i, 5));
      const ringB = Array.from({ length: 5 }, (_, i) => polar(20, i, 5, -Math.PI / 2 + Math.PI / 5));
      return (
        <g className="sigil-3d-group">
          <polygon points={pointsString(ringA)} fill="none" stroke="currentColor" strokeWidth="0.9" />
          <polygon points={pointsString(ringB)} fill="none" stroke="currentColor" strokeWidth="0.9" />
          {ringA.map(([x, y], i) => <line key={i} x1={x} y1={y} x2={ringB[i][0]} y2={ringB[i][1]} stroke="currentColor" strokeWidth="0.65" />)}
          {ringA.map(([x, y], i) => <line key={`c${i}`} x1={x} y1={y} x2={ringB[(i + 2) % 5][0]} y2={ringB[(i + 2) % 5][1]} stroke="currentColor" strokeWidth="0.45" />)}
        </g>
      );
    }
    case 'torus':
      return (
        <g className="sigil-flat-group">
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx="50" cy="50" rx="40" ry="13" fill="none" stroke="currentColor" strokeWidth="0.5" transform={`rotate(${i * (180 / 14)} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </g>
      );
    case 'yantra': {
      const scales = [1, 0.8, 0.61, 0.44];
      return (
        <g className="sigil-flat-group">
          {scales.map((scale, i) => (
            <React.Fragment key={scale}>
              <polygon points={pointsString([[50, 9 + 12 * i], [90 - 10 * i, 77 - 4 * i], [10 + 10 * i, 77 - 4 * i]])} fill="none" stroke="currentColor" strokeWidth="0.8" />
              <polygon points={pointsString([[50, 91 - 12 * i], [90 - 10 * i, 23 + 4 * i], [10 + 10 * i, 23 + 4 * i]])} fill="none" stroke="currentColor" strokeWidth="0.8" />
            </React.Fragment>
          ))}
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </g>
      );
    }
    case 'pentagram': {
      const vertices = Array.from({ length: 5 }, (_, i) => polar(43, i, 5));
      const order = [0, 2, 4, 1, 3];
      return (
        <g className="sigil-flat-group">
          <polygon points={pointsString(order.map((index) => vertices[index]))} fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
        </g>
      );
    }
    case 'heptadic-rays':
      return (
        <g className="sigil-flat-group">
          {Array.from({ length: 7 }, (_, i) => {
            const [x1, y1] = polar(8, i, 7);
            const [x2, y2] = polar(44, i, 7);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />;
          })}
          <polygon points={pointsString([0,2,4,6,1,3,5].map((i) => polar(39, i, 7)))} fill="none" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </g>
      );
    case 'sephiroth': {
      const nodes = [[50,8],[31,28],[69,28],[50,41],[30,53],[70,53],[50,65],[32,79],[68,79],[50,94]];
      const edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[1,4],[2,3],[2,5],[3,4],[3,5],[3,6],[4,5],[4,6],[4,7],[5,6],[5,8],[6,7],[6,8],[6,9],[7,8],[7,9],[8,9]];
      return (
        <g className="sigil-flat-group">
          {edges.map(([a, b], i) => <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="currentColor" strokeWidth="0.45" />)}
          {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 0 || i === 9 ? 3.2 : 2.5} fill="none" stroke="currentColor" strokeWidth="0.9" />)}
        </g>
      );
    }
    case 'spiral':
      return (
        <g className="sigil-flat-group">
          <path d="M50 50 C54 42 65 43 66 53 C68 67 49 73 37 64 C19 50 31 24 55 22 C86 20 98 55 80 78 C59 104 15 91 7 57" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </g>
      );
    case 'egg':
      return (
        <g className="sigil-flat-group">
          <ellipse cx="50" cy="53" rx="32" ry="44" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <ellipse cx="50" cy="55" rx="20" ry="30" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
          <circle cx="50" cy="55" r="3" fill="currentColor" />
        </g>
      );
    case 'mercurial':
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="43" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="50" cy="43" r="2.5" fill="currentColor" />
          <path d="M31 29 C37 12 63 12 69 29" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="50" y1="63" x2="50" y2="91" stroke="currentColor" strokeWidth="1.2" />
          <line x1="36" y1="78" x2="64" y2="78" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case 'four-elements':
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="4" fill="currentColor" />
          {Array.from({ length: 4 }, (_, i) => {
            const [x2, y2] = polar(40, i, 4, -Math.PI / 4);
            return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />;
          })}
          <polygon points={pointsString(Array.from({ length: 4 }, (_, i) => polar(40, i, 4, -Math.PI / 4)))} fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.45" strokeDasharray="2 3" />
        </g>
      );
    case 'square-circle':
      return (
        <g className="sigil-flat-group">
          <rect x="21" y="21" width="58" height="58" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="2" fill="currentColor" />
        </g>
      );
    case 'tetractys':
      return (
        <g className="sigil-flat-group">
          {[1,2,3,4].flatMap((row) => Array.from({ length: row }, (_, i) => {
            const spacing = 18;
            const y = 18 + (row - 1) * 20;
            const x = 50 + (i - (row - 1) / 2) * spacing;
            return <circle key={`${row}-${i}`} cx={x} cy={y} r="3.2" fill="currentColor" />;
          }))}
          <polygon points="50,12 84,82 16,82" fill="none" stroke="currentColor" strokeWidth="0.7" />
        </g>
      );
    default:
      return <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" />;
  }
}

export default function RitualProjection({
  kind,
  variant = 'echo',
  charge = 0,
  memoryCount = 0,
  className = '',
}) {
  const q = clamp(Number(charge) || 0, 0, 1);
  const memory = clamp(Number(memoryCount) || 0, 0, 12) / 12;
  const baseOpacity = variant === 'apparition' ? 0.2 : variant === 'operative' ? 0.34 : 0.28;
  const opacity = clamp(baseOpacity + q * 0.34 + memory * 0.16, 0.12, 0.82);
  const glow = 7 + q * 16 + memory * 7;

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`overflow-visible text-[var(--ink-red)] ${className}`}
      style={{
        opacity,
        filter: `drop-shadow(0 0 ${glow.toFixed(1)}px var(--ink-red)) drop-shadow(0 0 ${(glow * 0.6).toFixed(1)}px var(--ink-gold))`,
        transition: 'opacity 700ms ease, filter 700ms ease, transform 700ms ease',
      }}
    >
      <ProjectionGeometry kind={kind} />
    </svg>
  );
}

export function RitualApparition({ theoremId, active }) {
  const projection = getProjectionSpec(theoremId);
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[8] flex items-center justify-center transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <RitualProjection
        kind={projection.echo}
        variant="apparition"
        charge={active ? 0.45 : 0}
        className="w-[68vmin] h-[68vmin] max-w-[760px] max-h-[760px] mix-blend-screen"
      />
    </div>
  );
}
