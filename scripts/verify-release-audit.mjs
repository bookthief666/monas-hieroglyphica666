import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THEOREMS } from '../src/data/theorems.js';
import { getSourceWitness } from '../src/lib/sourceWitness.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const pinnedRawGithub = /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[0-9a-f]{40}\//i;

const vite = read('../vite.config.js');
const index = read('../index.html');
const audio = read('../src/components/AudioEngine.jsx');
const sourceWitness = read('../src/components/SourceWitness.jsx');
const mirrorMemory = read('../src/lib/mirrorMemory.js');
const verifyWorkflow = read('../.github/workflows/verify-living-black-mirror.yml');
const deployWorkflow = read('../.github/workflows/deploy.yml');

assert.match(vite, /base:\s*['"]\.\/['"]/, 'GitHub Pages build must retain a relative Vite base');
assert.match(index, /<meta name="viewport"/, 'Production entry point must declare a mobile viewport');
assert.match(index, /<meta name="description"/, 'Production entry point must ship descriptive metadata');
assert.match(index, /<html lang="en">/, 'Production document must expose a language');

assert.equal(THEOREMS.length, 24, 'Release must contain all 24 theorems');
const backgrounds = THEOREMS.map((theorem) => theorem.bgImage);
assert.equal(new Set(backgrounds).size, 24, 'Every theorem should retain its own background witness');
backgrounds.forEach((url, index) => {
  assert.match(url, pinnedRawGithub, `Theorem ${index + 1} background must use an immutable GitHub commit URL`);
});

const audioMatch = audio.match(/const AUDIO_SRC\s*=\s*\n?\s*['"]([^'"]+)['"]/);
assert.ok(audioMatch, 'Ambient audio source must remain explicit and auditable');
assert.match(audioMatch[1], pinnedRawGithub, 'Ambient audio must use an immutable GitHub commit URL');

const witness = getSourceWitness(1);
for (const [label, url] of [
  ['1564 facsimile', witness.facsimileUrl],
  ['catalogue', witness.catalogueUrl],
  ['translation reference', witness.translationReferenceUrl],
]) {
  assert.match(url, /^https:\/\//, `${label} must use HTTPS`);
}
assert.match(sourceWitness, /target="_blank"[\s\S]*?rel="noreferrer"/, 'External source links must use noreferrer');

assert.match(mirrorMemory, /try\s*\{[\s\S]*localStorage\.getItem/, 'Persistent memory reads must be guarded');
assert.match(mirrorMemory, /try\s*\{[\s\S]*localStorage\.setItem/, 'Persistent memory writes must be guarded');
assert.match(mirrorMemory, /catch\s*\{[\s\S]*return null;/, 'Persistent memory failure must degrade safely');

assert.match(verifyWorkflow, /agent\/release-candidate-polish/, 'Release candidate branch must receive verification CI');
assert.match(verifyWorkflow, /pull_request:[\s\S]*branches:\s*\[main\]/, 'Pull requests into main must receive verification CI');
assert.match(verifyWorkflow, /- main/, 'Main pushes must receive verification CI');

assert.match(deployWorkflow, /push:[\s\S]*branches:\s*\[main\]/, 'Pages deployment must auto-run only from main');
assert.doesNotMatch(deployWorkflow, /claude\/ecstatic-euler/, 'Obsolete development branches must never auto-deploy');
assert.match(deployWorkflow, /run:\s*npm run check/, 'Deployment must execute the full release verification contract before upload');
assert.match(deployWorkflow, /needs:\s*build/, 'Pages deploy must depend on the verified build job');

console.log('Production release audit gate PASS: Pages base/metadata, 24 immutable backgrounds, pinned audio, HTTPS witnesses, guarded persistence, main-only verified deployment.');
