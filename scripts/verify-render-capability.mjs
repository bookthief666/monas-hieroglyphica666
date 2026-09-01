import assert from 'node:assert/strict';
import { shouldUse3DOrb } from '../src/lib/renderCapability.js';

const desktop = {
  webglAvailable: true,
  width: 1440,
  height: 900,
  touchFirst: false,
  coarsePointer: false,
  hoverNone: false,
  reducedMotion: false,
  saveData: false,
  constrained: false,
  maxTouchPoints: 0,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140 Safari/537.36',
};

assert.equal(shouldUse3DOrb(desktop), true, 'Fine-pointer desktop should retain the 3D shew-stone');
assert.equal(
  shouldUse3DOrb({ ...desktop, width: 884, height: 1100, maxTouchPoints: 10, touchFirst: true, coarsePointer: true, hoverNone: true }),
  false,
  'Fold portrait must always use the particle mirror',
);
assert.equal(
  shouldUse3DOrb({ ...desktop, width: 1280, height: 720, maxTouchPoints: 10, userAgent: desktop.userAgent }),
  false,
  'Fold desktop-site mode must not bypass the touch-device guard',
);
assert.equal(
  shouldUse3DOrb({ ...desktop, width: 1600, height: 1000, userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-F956U) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36' }),
  false,
  'Android UA must never receive the transmission-material orb',
);
assert.equal(shouldUse3DOrb({ ...desktop, reducedMotion: true }), false, 'Reduced motion must disable the 3D orb');
assert.equal(shouldUse3DOrb({ ...desktop, saveData: true }), false, 'Save-Data must disable the 3D orb');
assert.equal(shouldUse3DOrb({ ...desktop, constrained: true }), false, 'Constrained devices must disable the 3D orb');
assert.equal(shouldUse3DOrb({ ...desktop, webglAvailable: false }), false, 'No WebGL must fall back cleanly');
assert.equal(shouldUse3DOrb({ ...desktop, width: 960 }), false, 'Small fine-pointer surfaces should prefer the particle mirror');

console.log('Renderer capability verifier PASS: Fold/touch-first paths are locked to the particle mirror; desktop 3D remains available.');
