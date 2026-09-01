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
assert.match(css, /living-black-mirror > canvas/, 'Fold-safe mode must explicitly isolate the 2D mirror canvas');
assert.match(css, /background:\s*radial-gradient[\s\S]*#000/, 'Fold-safe mirror must have an explicit dark backing field');

console.log('Fold runtime verifier PASS: force2d is live, inactive apparitions unmount, and Samsung-safe compositor rules are wired.');
