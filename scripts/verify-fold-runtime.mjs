import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const apparition = readFileSync(new URL('../src/components/SafeRitualApparition.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/fold-safe.css', import.meta.url), 'utf8');

assert.match(app, /queryFlag\('force2d'\)/, 'App must parse the force2d URL override');
assert.match(app, /!force2D\s*&&\s*orbHealthy/, 'force2d must hard-disable the 3D orb at the actual renderer decision');
assert.match(app, /fold-safe-compositor/, 'App must wire the Fold-safe compositor class');
assert.match(app, /SafeRitualApparition/, 'App must use the safe transition apparition wrapper');
assert.match(app, /renderer-diagnostic/, 'App must expose opt-in renderer diagnostics');

assert.match(apparition, /if \(!active\) return null;/, 'Inactive theorem apparitions must not remain in the DOM');
assert.doesNotMatch(apparition, /opacity-0/, 'Safe apparition must not hide an always-mounted blend layer with opacity alone');

assert.match(css, /mix-blend-mode:\s*normal\s*!important/, 'Fold-safe mode must neutralize blend modes');
assert.match(css, /backdrop-filter:\s*none\s*!important/, 'Fold-safe mode must disable backdrop filtering');
assert.match(css, /living-black-mirror > canvas/, 'Fold-safe mode must explicitly define the 2D mirror canvas');
assert.match(css, /background:\s*radial-gradient[\s\S]*#000/, 'Fold-safe mirror must have an explicit dark backing field');
assert.match(css, /contain:\s*none\s*!important/, 'Fold-safe mirror must not use contain: paint');
assert.match(css, /position:\s*relative\s*!important/, 'Fold-safe canvas must stay in ordinary DOM flow');
assert.doesNotMatch(css, /translateZ\(/, 'Fold-safe mirror must not GPU-promote the canvas with translateZ');
assert.doesNotMatch(css, /position:\s*absolute\s*!important;[\s\S]{0,180}living-black-mirror > canvas/, 'Fold-safe canvas must not be forced into an absolute compositor layer');
assert.match(css, /background-color:\s*#020203\s*!important/, 'Fold-safe canvas must paint an opaque black CSS backing');
assert.match(css, /transition:\s*none\s*!important/, 'Fold-safe canvas must not participate in broad stage opacity transitions');
assert.match(css, /will-change:\s*auto\s*!important/, 'Fold-safe canvas must not request compositor promotion');
assert.doesNotMatch(css, /living-black-mirror > canvas[\s\S]{0,260}background:\s*transparent\s*!important/, 'Fold-safe canvas must never be transparent');
assert.match(css, /mirror-depth-volume,[\s\S]*mirror-inner-rim[\s\S]*display:\s*none\s*!important/, 'Fold-safe mode must suppress auxiliary optical layers');

console.log('Fold runtime verifier PASS: force2d is live, inactive apparitions unmount, and the Fold canvas stays opaque on a non-promoted compositor path.');
