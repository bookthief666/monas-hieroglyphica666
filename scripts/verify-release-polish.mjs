import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const nav = read('../src/components/TheoremNav.jsx');
const reliquary = read('../src/components/ReliquaryIllumination.jsx');
const css = read('../src/release-polish.css');

assert.match(nav, /Theorem Ladder · I—XXIV/, 'The theorem rail must announce the full I–XXIV range');
assert.match(nav, /Tap a numeral · swipe to continue/, 'Touch users need an explicit horizontal-navigation affordance');
assert.match(nav, /theorem-rail-control-right/, 'The rail needs a visible later-theorems control');
assert.match(nav, /theorem-rail-control-left/, 'The rail needs a visible earlier-theorems control');
assert.match(nav, /aria-current=\{isActive \? 'page'/, 'The active theorem must expose aria-current=page');
assert.match(nav, /aria-label=\{`Open Theorem/, 'Each numeral must expose an explicit destination label');
assert.match(nav, /w-11 h-11/, 'Touch theorem targets must be at least 44×44 CSS pixels');
assert.match(nav, /getBoundingClientRect\(\)/, 'Active-theorem centering must use rail-local geometry');
assert.match(nav, /scroll-snap/, 'The theorem rail must use intentional horizontal snapping');

assert.match(reliquary, /reliquary-section-compact/, 'The recovered-figure section must use the compact release hierarchy');
assert.match(css, /height:\s*clamp\(218px,\s*44vw,\s*330px\)/, 'The reliquary plate must stay materially smaller than the vision-complete prototype');
assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*height:\s*230px/, 'Fold/phone reliquary height must remain compact');
assert.match(css, /scrollbar-color:/, 'The horizontal theorem rail must retain a discoverable native scroll cue where supported');
assert.match(css, /@media\s*\(min-width:\s*768px\)/, 'Desktop must be allowed to return to the wrapped ladder presentation');
assert.doesNotMatch(css, /(^|[;{]\s*)filter\s*:/m, 'Release polish must not introduce CSS filters');
assert.doesNotMatch(css, /backdrop-filter\s*:/, 'Release polish must not introduce backdrop filtering');

console.log('Release polish verifier PASS: compact reliquary, explicit I–XXIV rail, 44px touch targets, scroll controls, and compositor-cheap styling locked.');
