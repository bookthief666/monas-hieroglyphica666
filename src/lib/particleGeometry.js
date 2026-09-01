const TAU = Math.PI * 2;

export function hash01(n, seed = 1) {
  const x = Math.sin((n + 1) * 12.9898 + seed * 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function pointOnPolyline(points, t, closed = false) {
  if (!points.length) return [0, 0];
  const segCount = closed ? points.length : points.length - 1;
  const p = Math.max(0, Math.min(0.999999, t)) * segCount;
  const seg = Math.floor(p);
  const f = p - seg;
  const a = points[seg];
  const b = points[(seg + 1) % points.length];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function regularPolygon(sides, radius, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i / sides) * TAU;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });
}

function starPolyline(points, radius, step = 2, rotation = -Math.PI / 2) {
  const verts = regularPolygon(points, radius, rotation);
  const out = [];
  let idx = 0;
  const visited = new Set();
  while (!visited.has(idx)) {
    visited.add(idx);
    out.push(verts[idx]);
    idx = (idx + step) % points;
  }
  return out;
}

function edgePoint(edges, t) {
  const p = Math.max(0, Math.min(0.999999, t)) * edges.length;
  const edgeIndex = Math.floor(p);
  const f = p - edgeIndex;
  const [a, b] = edges[edgeIndex];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function projectedCubeEdges(radius) {
  const o = radius;
  const i = radius * 0.54;
  const off = radius * 0.26;
  const outer = [[-o, -o], [o, -o], [o, o], [-o, o]];
  const inner = [[-i + off, -i - off], [i + off, -i - off], [i + off, i - off], [-i + off, i - off]];
  const edges = [];
  for (let k = 0; k < 4; k++) {
    edges.push([outer[k], outer[(k + 1) % 4]]);
    edges.push([inner[k], inner[(k + 1) % 4]]);
    edges.push([outer[k], inner[k]]);
  }
  return edges;
}

function icosaProjection(radius) {
  const ringTop = regularPolygon(5, radius * 0.72, -Math.PI / 2);
  const ringBottom = regularPolygon(5, radius * 0.72, -Math.PI / 2 + Math.PI / 5)
    .map(([x, y]) => [x, y + radius * 0.16]);
  const top = [0, -radius];
  const bottom = [0, radius];
  const edges = [];
  for (let i = 0; i < 5; i++) {
    edges.push([top, ringTop[i]]);
    edges.push([ringTop[i], ringTop[(i + 1) % 5]]);
    edges.push([ringTop[i], ringBottom[i]]);
    edges.push([ringTop[i], ringBottom[(i + 4) % 5]]);
    edges.push([ringBottom[i], ringBottom[(i + 1) % 5]]);
    edges.push([ringBottom[i], bottom]);
  }
  return edges;
}

function metatronEdges(radius) {
  const center = [0, 0];
  const ring = regularPolygon(6, radius * 0.72, -Math.PI / 2);
  const outer = regularPolygon(6, radius, -Math.PI / 2);
  const edges = [];
  for (let i = 0; i < 6; i++) {
    edges.push([center, ring[i]]);
    edges.push([ring[i], ring[(i + 1) % 6]]);
    edges.push([ring[i], outer[i]]);
    edges.push([ring[i], outer[(i + 1) % 6]]);
    edges.push([outer[i], outer[(i + 1) % 6]]);
  }
  return edges;
}

function sriYantraEdges(radius) {
  const tris = [
    [[0, -1], [0.92, 0.68], [-0.92, 0.68]],
    [[0, 1], [0.88, -0.6], [-0.88, -0.6]],
    [[0, -0.78], [0.72, 0.52], [-0.72, 0.52]],
    [[0, 0.78], [0.68, -0.46], [-0.68, -0.46]],
    [[0, -0.58], [0.54, 0.4], [-0.54, 0.4]],
    [[0, 0.58], [0.5, -0.34], [-0.5, -0.34]],
    [[0, -0.4], [0.38, 0.28], [-0.38, 0.28]],
    [[0, 0.4], [0.34, -0.22], [-0.34, -0.22]],
  ];
  return tris.flatMap((tri) => {
    const p = tri.map(([x, y]) => [x * radius, y * radius]);
    return [[p[0], p[1]], [p[1], p[2]], [p[2], p[0]]];
  });
}

const TREE_NODES = [
  [0, -0.95],
  [-0.48, -0.62], [0.48, -0.62],
  [0, -0.34],
  [-0.5, -0.08], [0.5, -0.08],
  [0, 0.2],
  [-0.45, 0.5], [0.45, 0.5],
  [0, 0.92],
];

const TREE_EDGES = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [1, 4], [2, 3], [2, 5],
  [3, 4], [3, 5], [3, 6], [4, 5], [4, 6], [4, 7], [5, 6], [5, 8],
  [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [8, 9],
];

function sephirothPoint(r, index, radius, theoremId) {
  if (r < 0.42) {
    const nodeIndex = Math.floor((r / 0.42) * TREE_NODES.length) % TREE_NODES.length;
    const [nx, ny] = TREE_NODES[nodeIndex];
    const jitterR = Math.sqrt(hash01(index, theoremId + 9)) * radius * 0.055;
    const a = hash01(index, theoremId + 31) * TAU;
    return [nx * radius * 0.9 + Math.cos(a) * jitterR, ny * radius + Math.sin(a) * jitterR];
  }
  const t = (r - 0.42) / 0.58;
  const edge = TREE_EDGES[Math.floor(t * TREE_EDGES.length) % TREE_EDGES.length];
  const local = (t * TREE_EDGES.length) % 1;
  const a = TREE_NODES[edge[0]];
  const b = TREE_NODES[edge[1]];
  return [
    (a[0] + (b[0] - a[0]) * local) * radius * 0.9,
    (a[1] + (b[1] - a[1]) * local) * radius,
  ];
}

export function targetForParticle(shape, index, count, cx, cy, baseRadius, theoremId = 1) {
  const r = index / Math.max(1, count);
  let x = 0;
  let y = 0;

  if (shape === 'line-circle') {
    if (r < 0.6) {
      const a = (r / 0.6) * TAU;
      x = Math.cos(a) * baseRadius;
      y = Math.sin(a) * baseRadius;
    } else {
      y = (((r - 0.6) / 0.4) - 0.5) * baseRadius * 2.5;
    }
  } else if (shape === 'point-line-circle') {
    if (r < 0.1) {
      const a = hash01(index, theoremId) * TAU;
      const d = hash01(index, theoremId + 3) * 3;
      x = Math.cos(a) * d;
      y = Math.sin(a) * d;
    } else if (r < 0.5) {
      y = -((r - 0.1) / 0.4) * baseRadius * 1.5;
    } else {
      const a = ((r - 0.5) / 0.5) * TAU;
      x = Math.cos(a) * baseRadius * 0.9;
      y = Math.sin(a) * baseRadius * 0.9;
    }
  } else if (shape === 'sun-earth') {
    const a = r * TAU;
    const d = r < 0.15 ? hash01(index, theoremId) * 4 : baseRadius + (hash01(index, theoremId + 7) - 0.5) * 4;
    x = Math.cos(a) * d;
    y = Math.sin(a) * d;
  } else if (shape === 'sun-moon') {
    if (r < 0.5) {
      const a = (r / 0.5) * TAU;
      x = Math.cos(a) * baseRadius * 0.9;
      y = Math.sin(a) * baseRadius * 0.9;
    } else {
      const a = Math.PI + ((r - 0.5) / 0.5) * Math.PI;
      x = Math.cos(a) * baseRadius * 0.75;
      y = -baseRadius * 0.8 + Math.sin(a) * baseRadius * 0.75;
    }
  } else if (shape === 'cross-rotated' || shape === 'cross-quaternary') {
    const r2 = r * 2;
    if (r2 < 1) {
      x = (r2 - 0.5) * baseRadius * 2;
      y = (r2 - 0.5) * baseRadius * 2;
    } else {
      x = (r2 - 1.5) * baseRadius * 2;
      y = -(r2 - 1.5) * baseRadius * 2;
    }
  } else if (shape === 'triangle-fire') {
    [x, y] = pointOnPolyline([[0, -baseRadius], [baseRadius, baseRadius], [-baseRadius, baseRadius]], r, true);
  } else if (shape === 'square-circle') {
    if (r < 0.5) {
      const a = (r / 0.5) * TAU;
      x = Math.cos(a) * baseRadius;
      y = Math.sin(a) * baseRadius;
    } else {
      [x, y] = pointOnPolyline([
        [-baseRadius * 0.9, -baseRadius * 0.9], [baseRadius * 0.9, -baseRadius * 0.9],
        [baseRadius * 0.9, baseRadius * 0.9], [-baseRadius * 0.9, baseRadius * 0.9],
      ], (r - 0.5) / 0.5, true);
    }
  } else if (shape === 'aries-cross') {
    if (r < 0.38) {
      y = ((r / 0.38) - 0.5) * baseRadius * 2;
    } else if (r < 0.66) {
      x = (((r - 0.38) / 0.28) - 0.5) * baseRadius * 2;
    } else {
      const side = r < 0.83 ? -1 : 1;
      const local = side < 0 ? (r - 0.66) / 0.17 : (r - 0.83) / 0.17;
      const a = Math.PI * local;
      x = side * (baseRadius * 0.22 + Math.cos(a) * baseRadius * 0.34);
      y = -baseRadius * 0.72 - Math.sin(a) * baseRadius * 0.38;
    }
  } else if (shape === 'metatron') {
    [x, y] = edgePoint(metatronEdges(baseRadius), r);
  } else if (shape === 'icosahedron') {
    [x, y] = edgePoint(icosaProjection(baseRadius), r);
  } else if (shape === 'torus') {
    const u = r * TAU * 7;
    const v = r * TAU * 3;
    const ring = baseRadius * 0.72;
    const tube = baseRadius * 0.22;
    x = (ring + tube * Math.cos(v)) * Math.cos(u);
    y = (ring + tube * Math.cos(v)) * Math.sin(u) * 0.7 + Math.sin(v) * tube * 0.22;
  } else if (shape === 'sri-yantra') {
    [x, y] = edgePoint(sriYantraEdges(baseRadius), r);
  } else if (shape === 'pentagram') {
    [x, y] = pointOnPolyline(starPolyline(5, baseRadius, 2), r, true);
  } else if (shape === 'sacred-252') {
    const spokes = 7;
    const ray = Math.floor(r * spokes) % spokes;
    const local = (r * spokes) % 1;
    const a = (ray / spokes) * TAU - Math.PI / 2;
    const d = baseRadius * (0.18 + 0.8 * local);
    x = Math.cos(a) * d;
    y = Math.sin(a) * d;
  } else if (shape === 'monad-full') {
    if (r < 0.22) {
      const a = (r / 0.22) * TAU;
      x = Math.cos(a) * baseRadius * 0.3;
      y = -baseRadius * 0.32 + Math.sin(a) * baseRadius * 0.3;
    } else if (r < 0.4) {
      y = -baseRadius * 0.02 + ((r - 0.22) / 0.18) * baseRadius * 0.92;
    } else if (r < 0.58) {
      x = -baseRadius * 0.42 + ((r - 0.4) / 0.18) * baseRadius * 0.84;
      y = baseRadius * 0.48;
    } else {
      const local = (r - 0.58) / 0.42;
      const side = local < 0.5 ? -1 : 1;
      const a = (local % 0.5) / 0.5 * Math.PI;
      x = side * (baseRadius * 0.14 + Math.cos(a) * baseRadius * 0.28);
      y = baseRadius * 0.78 - Math.sin(a) * baseRadius * 0.27;
    }
  } else if (shape === 'hermetic-egg') {
    const a = r * TAU;
    x = Math.cos(a) * baseRadius * 0.76 * (0.86 + 0.14 * Math.sin(a));
    y = Math.sin(a) * baseRadius * 1.08;
  } else if (shape === 'sephiroth') {
    [x, y] = sephirothPoint(r, index, baseRadius, theoremId);
  } else if (shape === 'albedo-rubedo') {
    const left = r < 0.5;
    const local = left ? r / 0.5 : (r - 0.5) / 0.5;
    const a = local * TAU;
    x = (left ? -0.24 : 0.24) * baseRadius + Math.cos(a) * baseRadius * 0.62;
    y = Math.sin(a) * baseRadius * 0.62;
  } else if (shape === 'radiance') {
    const rayCount = 24;
    const ray = index % rayCount;
    const a = (ray / rayCount) * TAU;
    const d = baseRadius * (0.12 + 1.22 * hash01(index, theoremId + 41));
    x = Math.cos(a) * d;
    y = Math.sin(a) * d;
  } else if (shape === 'hypercube-stone') {
    [x, y] = edgePoint(projectedCubeEdges(baseRadius * 0.72), r);
  } else if (shape === 'infinite-spiral') {
    const a = r * TAU * 6.5;
    const d = (0.08 + r * 1.12) * baseRadius;
    x = Math.cos(a) * d;
    y = Math.sin(a) * d;
  } else {
    if (r < 0.5) y = (r - 0.25) * baseRadius * 2.3;
    else x = (r - 0.75) * baseRadius * 2.3;
  }

  return { x: cx + x, y: cy + y };
}
