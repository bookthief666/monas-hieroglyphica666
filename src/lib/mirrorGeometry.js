import { hash01, targetForParticle } from './particleGeometry.js';

const TAU = Math.PI * 2;

function regularPoints(count, cx, cy, radius, rotation = -Math.PI / 2) {
  return Array.from({ length: count }, (_, i) => {
    const a = rotation + (i / count) * TAU;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });
}

export function particleRole(index, theoremId = 1) {
  const value = hash01(index, theoremId * 31 + 7);
  if (value < 0.58) return 'structural';
  if (value < 0.87) return 'aether';
  return 'singularity';
}

export function buildSkeletonSegments(shape, cx, cy, radius, theoremId = 1, sampleCount = 288) {
  const points = Array.from({ length: sampleCount }, (_, index) =>
    targetForParticle(shape, index, sampleCount, cx, cy, radius, theoremId));
  const threshold = Math.max(13, radius * 0.34);
  const thresholdSq = threshold * threshold;
  const segments = [];
  let current = [];

  for (const point of points) {
    const prev = current[current.length - 1];
    if (prev) {
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      if (dx * dx + dy * dy > thresholdSq) {
        if (current.length > 1) segments.push(current);
        current = [];
      }
    }
    current.push(point);
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

export function singularityAnchors(shape, cx, cy, radius) {
  const center = [{ x: cx, y: cy }];
  const cardinals = [
    { x: cx, y: cy - radius },
    { x: cx + radius, y: cy },
    { x: cx, y: cy + radius },
    { x: cx - radius, y: cy },
  ];

  switch (shape) {
    case 'line-circle':
      return center.concat(cardinals);
    case 'point-line-circle':
      return center.concat([{ x: cx, y: cy - radius * 0.95 }]);
    case 'sun-earth':
    case 'radiance':
      return center.concat(cardinals);
    case 'sun-moon':
      return center.concat([
        { x: cx, y: cy - radius * 0.8 },
        { x: cx - radius * 0.72, y: cy - radius * 0.8 },
        { x: cx + radius * 0.72, y: cy - radius * 0.8 },
      ]);
    case 'cross-rotated':
    case 'cross-quaternary':
      return center.concat(regularPoints(4, cx, cy, radius, Math.PI / 4));
    case 'triangle-fire':
      return center.concat(regularPoints(3, cx, cy, radius, -Math.PI / 2));
    case 'square-circle':
      return center.concat(regularPoints(4, cx, cy, radius * 0.9, Math.PI / 4));
    case 'aries-cross':
      return center.concat([
        { x: cx, y: cy - radius * 0.72 },
        { x: cx - radius * 0.48, y: cy - radius * 0.8 },
        { x: cx + radius * 0.48, y: cy - radius * 0.8 },
      ]);
    case 'metatron':
      return center.concat(regularPoints(6, cx, cy, radius * 0.72));
    case 'icosahedron':
      return center.concat(regularPoints(5, cx, cy, radius * 0.72));
    case 'torus':
      return center.concat(regularPoints(8, cx, cy, radius * 0.72));
    case 'sri-yantra':
      return center.concat(regularPoints(6, cx, cy, radius * 0.76));
    case 'pentagram':
      return center.concat(regularPoints(5, cx, cy, radius));
    case 'sacred-252':
      return center.concat(regularPoints(7, cx, cy, radius * 0.95));
    case 'monad-full':
      return center.concat([
        { x: cx, y: cy - radius * 0.32 },
        { x: cx, y: cy + radius * 0.48 },
        { x: cx - radius * 0.34, y: cy + radius * 0.78 },
        { x: cx + radius * 0.34, y: cy + radius * 0.78 },
      ]);
    case 'hermetic-egg':
      return center.concat([
        { x: cx, y: cy - radius * 1.12 },
        { x: cx, y: cy + radius * 1.12 },
      ]);
    case 'sephiroth': {
      const nodes = [
        [0, -0.95], [-0.48, -0.62], [0.48, -0.62], [0, -0.34], [-0.5, -0.08],
        [0.5, -0.08], [0, 0.2], [-0.45, 0.5], [0.45, 0.5], [0, 0.92],
      ];
      return nodes.map(([x, y]) => ({ x: cx + x * radius * 0.9, y: cy + y * radius }));
    }
    case 'albedo-rubedo':
      return center.concat([
        { x: cx - radius * 0.24, y: cy },
        { x: cx + radius * 0.24, y: cy },
      ]);
    case 'hypercube-stone':
      return center.concat([
        ...regularPoints(4, cx, cy, radius, Math.PI / 4),
        ...regularPoints(4, cx + radius * 0.18, cy - radius * 0.18, radius * 0.54, Math.PI / 4),
      ]);
    case 'infinite-spiral':
      return center.concat([
        { x: cx + radius * 1.35, y: cy },
        { x: cx - radius * 1.08, y: cy },
      ]);
    default:
      return center;
  }
}

export function roleTarget(role, baseTarget, index, theoremId, radius, anchors) {
  if (role === 'singularity' && anchors.length) {
    return anchors[index % anchors.length];
  }
  if (role === 'aether') {
    const angle = hash01(index, theoremId + 211) * TAU;
    const spread = radius * (0.025 + hash01(index, theoremId + 313) * 0.065);
    return {
      x: baseTarget.x + Math.cos(angle) * spread,
      y: baseTarget.y + Math.sin(angle) * spread,
    };
  }
  return baseTarget;
}
