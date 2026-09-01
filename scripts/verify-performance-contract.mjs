import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const css = read('../src/index.css');
const visionCss = read('../src/vision-completion.css');
const kinetic = read('../src/components/KineticText.jsx');
const decrypt = read('../src/lib/useScrollDecrypt.js');
const deconstructor = read('../src/components/Deconstructor.jsx');
const profile = read('../src/lib/useDeviceProfile.js');

assert.doesNotMatch(
  css,
  /\.stage-veil-transition\s*\*|\.stage-veil-transition\s*,\s*\.stage-veil-transition\s*\*/,
  'Stage transitions must never be attached to the entire descendant tree',
);
assert.match(
  css,
  /\.animate-pulse-glow\s*\{\s*animation:\s*none;/,
  'The live mirror subtree must not be wrapped in an animated CSS filter',
);
assert.match(
  css,
  /\.manuscript-grid[\s\S]*?filter:\s*none\s*!important;/,
  'Whole-manuscript blur must stay disabled during theorem transitions',
);
assert.match(
  css,
  /@media\s*\(pointer:\s*coarse\),\s*\(hover:\s*none\)/,
  'Touch-first devices must retain the reduced compositor path',
);

assert.doesNotMatch(
  visionCss,
  /(^|[;{]\s*)filter\s*:/m,
  'Recovered codex animation must not animate or attach CSS filters',
);
assert.doesNotMatch(
  visionCss,
  /backdrop-filter\s*:/,
  'Recovered codex surfaces must not reintroduce backdrop filtering on the Fold',
);
assert.match(visionCss, /@keyframes\s+reliquary-dust-condense/, 'The recovered plate must retain its smoke/pixel condensation gesture');
assert.match(visionCss, /@media\s*\(pointer:\s*coarse\),\s*\(hover:\s*none\)/, 'The recovered plate must have a touch-first cost reduction');
assert.match(visionCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'The recovered plate must honor reduced motion');

assert.doesNotMatch(
  kinetic,
  /Math\.random/,
  'Kinetic cipher glyphs must be deterministic between reveal steps',
);
assert.match(kinetic, /useMemo\(\(\) => scramble/, 'Cipher strings should be memoized');

assert.match(decrypt, /lastPublishedAt/, 'Decrypt publication must be rate-limited');
assert.match(decrypt, /requestSample/, 'DOM geometry reads must be event-sampled rather than frame-sampled');
assert.doesNotMatch(
  decrypt,
  /const tick = \([^)]*\) => \{[\s\S]*?recompute\(\);[\s\S]*?requestAnimationFrame\(tick\)/,
  'The decrypt animation frame must not force a layout read every frame',
);

assert.match(
  deconstructor,
  /requestAnimationFrame\(flushDrag\)/,
  'Anatomia drag state must be throttled to animation frames',
);
assert.match(
  profile,
  /capabilitySignature/,
  'Device profiling must ignore browser-chrome resize noise when capability bands are unchanged',
);

console.log('Living Grimoire performance contract PASS: stable cipher, sampled decrypt, throttled Anatomia, bounded stage/compositor transitions, compositor-cheap recovered codex motion.');
