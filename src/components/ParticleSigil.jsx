import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { getPalette } from '../data/palettes.js';
import { getManifestationSpec } from '../lib/manifestationSpec.js';
import { hash01, targetForParticle } from '../lib/particleGeometry.js';
import {
  buildSkeletonSegments,
  particleRole,
  roleTarget,
  singularityAnchors,
} from '../lib/mirrorGeometry.js';
import { recordMirrorOperation } from '../lib/mirrorMemory.js';
import useDeviceProfile from '../lib/useDeviceProfile.js';

const TAU = Math.PI * 2;
const EPSILON = 0.0001;
const MAX_RIPPLES = 9;
const MAX_SPARKS = 72;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let value = angle;
  while (value > Math.PI) value -= TAU;
  while (value < -Math.PI) value += TAU;
  return value;
}

function dynamicTarget(particle, spec, time, center, pointer) {
  let tx = particle.tx;
  let ty = particle.ty;
  const q = pointer.operativeCharge;
  if (q <= 0.001) return { x: tx, y: ty };

  const dx = tx - center.x;
  const dy = ty - center.y;
  const spinIntent = clamp(pointer.rotationIntent, -1, 1);

  if (spec.field === 'hypercube') {
    const pointerBias = pointer.active ? (pointer.x - center.x) / Math.max(1, center.x * 2) : 0;
    const angle = (Math.sin(time * 0.0007 * spec.motion.fieldRate) * 0.16 + pointerBias * 0.38) * q;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const depth = 1 - q * 0.14 * Math.sin(time * 0.001 + particle.phase);
    tx = center.x + (dx * c - dy * s) * depth;
    ty = center.y + (dx * s + dy * c) / Math.max(0.78, depth);
  } else if (spec.field === 'spiral') {
    const scale = 1 - spinIntent * q * 0.11;
    const angle = spinIntent * q * 0.08;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    tx = center.x + (dx * c - dy * s) * scale;
    ty = center.y + (dx * s + dy * c) * scale;
  } else if (spec.field === 'toroidal' || spec.field === 'vortex') {
    const angle = spinIntent * q * 0.12;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    tx = center.x + dx * c - dy * s;
    ty = center.y + dx * s + dy * c;
  } else if (spec.field === 'yantric') {
    const polarity = particle.index % 2 === 0 ? 1 : -1;
    const scale = 1 + polarity * q * 0.035 * Math.sin(time * 0.002 * spec.motion.fieldRate);
    tx = center.x + dx * scale;
    ty = center.y + dy / scale;
  } else if (spec.field === 'lunar') {
    const angle = Math.sin(time * 0.00075) * q * 0.055;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    tx = center.x + dx * c - dy * s;
    ty = center.y + dx * s + dy * c;
  }

  return { x: tx, y: ty };
}

function applyFieldLaw(particle, spec, time, center, pointer) {
  const dx = particle.x - center.x;
  const dy = particle.y - center.y;
  const distSq = dx * dx + dy * dy;
  if (distSq <= EPSILON) return;

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;
  const phase = time * 0.001 * spec.motion.fieldRate + particle.phase;
  const energy = pointer.energy;
  const charge = pointer.operativeCharge * spec.operative.fieldGain;
  const release = pointer.releaseImpulse;

  switch (spec.field) {
    case 'seed': {
      const collapse = (0.0025 + charge * 0.012) * (particle.role === 'singularity' ? 1.15 : 0.9);
      particle.vx -= nx * collapse;
      particle.vy -= ny * collapse;
      if (release > 0.01) {
        particle.vx += nx * release * 0.018;
        particle.vy += ny * release * 0.018;
      }
      break;
    }
    case 'solar':
    case 'radial':
    case 'radiant': {
      const pulse = Math.sin(phase * 1.7) * 0.0045 * (1 + energy * 1.8 + charge * 2.4);
      particle.vx += nx * pulse * dist;
      particle.vy += ny * pulse * dist;
      if (release > 0.01) {
        const flare = release * (spec.field === 'radiant' ? 0.035 : 0.024);
        particle.vx += nx * flare;
        particle.vy += ny * flare;
      }
      break;
    }
    case 'lunar': {
      const lens = Math.sin(phase) * 0.012 * (0.4 + energy + charge * 1.3);
      particle.vx += -ny * lens;
      particle.vy += nx * lens * 0.65;
      break;
    }
    case 'axial':
    case 'lattice': {
      const lock = charge * (spec.field === 'lattice' ? 0.008 : 0.0065);
      particle.vx += (particle.tx - particle.x) * lock;
      particle.vy += (particle.ty - particle.y) * lock;
      break;
    }
    case 'stellar': {
      const arm = particle.index % 5;
      const polarity = arm % 2 === 0 ? 1 : -1;
      const pulse = Math.sin(phase * 2.2 + arm) * 0.008 * (0.5 + energy + charge);
      particle.vx += nx * pulse + -ny * pulse * polarity * charge * 0.4;
      particle.vy += ny * pulse + nx * pulse * polarity * charge * 0.4;
      break;
    }
    case 'vortex':
    case 'toroidal':
    case 'spiral': {
      const gestureDirection = Math.abs(pointer.rotationIntent) > 0.035 ? Math.sign(pointer.rotationIntent) : 1;
      const spin = 0.0075 * spec.motion.fieldRate
        * (0.35 + energy * 1.6 + charge * 2.2)
        * gestureDirection
        * spec.operative.spinGain;
      particle.vx += -ny * spin;
      particle.vy += nx * spin;
      if (spec.field === 'spiral') {
        const breathe = (Math.sin(phase * 1.35) * 0.0035) - pointer.rotationIntent * charge * 0.0045;
        particle.vx += nx * breathe;
        particle.vy += ny * breathe;
      }
      break;
    }
    case 'harmonic': {
      const resonance = Math.sin(phase * 2 + particle.index * 0.04) * 0.006 * (0.5 + energy + charge * 1.4);
      particle.vy += resonance;
      particle.vx += Math.cos(phase * 1.5) * resonance * charge * 0.35;
      break;
    }
    case 'polyhedral': {
      const lock = charge * 0.0075;
      particle.vx += (particle.tx - particle.x) * lock;
      particle.vy += (particle.ty - particle.y) * lock;
      break;
    }
    case 'yantric': {
      const polarity = particle.index % 2 === 0 ? 1 : -1;
      const opposition = charge * 0.012 * polarity;
      particle.vx += -ny * opposition;
      particle.vy += nx * opposition;
      break;
    }
    case 'monadic': {
      const inward = 0.0025 * (0.5 + energy + charge * 2.1);
      particle.vx -= nx * inward;
      particle.vy -= ny * inward;
      if (release > 0.01) {
        particle.vx += nx * release * 0.015;
        particle.vy += ny * release * 0.015;
      }
      break;
    }
    case 'egg': {
      particle.vx += Math.sin(phase) * 0.0025 * (1 + charge);
      particle.vy += Math.cos(phase * 0.7) * 0.0035 * (1 + charge * 0.65);
      break;
    }
    case 'sephirothic': {
      const pathPhase = phase * 2.4 - (particle.index % 29) * 0.28;
      const pulse = Math.max(0, Math.sin(pathPhase)) * charge * 0.012;
      const tdx = particle.tx - particle.x;
      const tdy = particle.ty - particle.y;
      particle.vx += tdx * pulse;
      particle.vy += tdy * pulse;
      if (particle.role === 'singularity') {
        particle.vx += nx * Math.sin(pathPhase) * charge * 0.006;
        particle.vy += ny * Math.sin(pathPhase) * charge * 0.006;
      }
      break;
    }
    case 'hypercube': {
      const depth = Math.sin(phase + (particle.index % 4) * Math.PI / 2) * 0.004 * (1 + charge * 2);
      particle.vx += nx * depth;
      particle.vy -= ny * depth;
      break;
    }
    default:
      break;
  }
}

function applyPointerField(particle, pointer, spec) {
  if (!pointer.active) return;

  const dx = particle.x - pointer.x;
  const dy = particle.y - pointer.y;
  const distSq = dx * dx + dy * dy;
  if (distSq <= EPSILON) return;

  const radius = spec.physics.radius * (1 + Math.min(pointer.speed, 2.5) * 0.12);
  if (distSq >= radius * radius) return;

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;
  const falloff = Math.pow(1 - dist / radius, 1.7);
  const pressure = pointer.down
    ? 1 + clamp(pointer.pressure || 0.5, 0, 1) * spec.physics.pressureGain
    : 1;

  let radial = pointer.down
    ? -spec.physics.holdForce * pressure
    : spec.physics.traceForce * (0.85 + Math.min(pointer.speed, 2.5) * 0.28);

  if (pointer.operative && ['emanation', 'radiance', 'flare'].includes(spec.operative.mode)) {
    radial = spec.physics.traceForce * pressure * (0.55 + pointer.operativeCharge * 0.9);
  } else if (pointer.operative && ['collapse', 'coagula'].includes(spec.operative.mode)) {
    radial *= 1 + pointer.operativeCharge * 0.95;
  } else if (pointer.operative) {
    radial *= 0.68;
  }

  particle.vx += nx * radial * falloff;
  particle.vy += ny * radial * falloff;

  const direction = ['circulation', 'winding', 'lensing'].includes(spec.operative.mode)
    && Math.abs(pointer.rotationIntent) > 0.035
    ? Math.sign(pointer.rotationIntent)
    : 1;
  const tangent = spec.physics.swirl
    * falloff
    * (0.35 + Math.min(pointer.speed, 3) + pointer.operativeCharge * spec.operative.spinGain)
    * direction;
  particle.vx += -ny * tangent;
  particle.vy += nx * tangent;
}

function applyRippleField(particle, ripples, spec, now) {
  for (const ripple of ripples) {
    const age = now - ripple.born;
    if (age < 0 || age > 1150) continue;

    const waveRadius = 8 + age * spec.physics.rippleSpeed;
    const dx = particle.x - ripple.x;
    const dy = particle.y - ripple.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= EPSILON) continue;

    const dist = Math.sqrt(distSq);
    const shell = Math.abs(dist - waveRadius);
    if (shell > 18) continue;

    const nx = dx / dist;
    const ny = dy / dist;
    const envelope = 1 - shell / 18;
    const decay = 1 - age / 1150;
    const force = spec.physics.rippleForce * ripple.strength * envelope * decay * 0.11 * (ripple.polarity || 1);
    particle.vx += nx * force;
    particle.vy += ny * force;
  }
}

export default function ParticleSigil({ currentShape, theoremId }) {
  const mirrorRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);
  const sparksRef = useRef([]);
  const burstCounterRef = useRef(0);
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    lastX: -1000,
    lastY: -1000,
    active: false,
    down: false,
    pressure: 0,
    speed: 0,
    energy: 0,
    pointerType: 'mouse',
    lastRippleAt: 0,
    holdStartedAt: 0,
    operative: false,
    operativeCharge: 0,
    releaseImpulse: 0,
    rotationIntent: 0,
    resolutionUntil: 0,
    lastDispatchAt: 0,
  });

  const profile = useDeviceProfile();
  const spec = useMemo(() => getManifestationSpec(theoremId, currentShape), [theoremId, currentShape]);

  const setMirrorFocus = useCallback((x, y, active, pressing = false) => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const rect = mirror.getBoundingClientRect();
    const px = rect.width > 0 ? clamp((x / rect.width) * 100, 0, 100) : 50;
    const py = rect.height > 0 ? clamp((y / rect.height) * 100, 0, 100) : 50;
    const nx = (px - 50) / 50;
    const ny = (py - 50) / 50;
    mirror.style.setProperty('--mirror-x', `${px}%`);
    mirror.style.setProperty('--mirror-y', `${py}%`);
    mirror.style.setProperty('--mirror-depth-x', `${(-nx * 3.2).toFixed(2)}px`);
    mirror.style.setProperty('--mirror-depth-y', `${(-ny * 3.2).toFixed(2)}px`);
    mirror.style.setProperty('--mirror-surface-x', `${(nx * 1.5).toFixed(2)}px`);
    mirror.style.setProperty('--mirror-surface-y', `${(ny * 1.5).toFixed(2)}px`);
    mirror.dataset.active = active ? 'true' : 'false';
    mirror.dataset.pressing = pressing ? 'true' : 'false';
  }, []);

  const localPoint = useCallback((event) => {
    const mirror = mirrorRef.current;
    if (!mirror) return null;
    const rect = mirror.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cx: rect.width / 2,
      cy: rect.height / 2,
    };
  }, []);

  const addRipple = useCallback((x, y, strength = 1, polarity = 1) => {
    if (!profile.enableRipples) return;
    const ripples = ripplesRef.current;
    ripples.push({ x, y, born: performance.now(), strength, polarity });
    if (ripples.length > MAX_RIPPLES) ripples.splice(0, ripples.length - MAX_RIPPLES);
  }, [profile.enableRipples]);

  const addSparkBurst = useCallback((x, y, strength = 1, direction = 0) => {
    const count = Math.min(profile.sparkBudget || 18, Math.round(8 + strength * 10));
    const burstId = burstCounterRef.current;
    burstCounterRef.current += 1;
    for (let i = 0; i < count; i += 1) {
      const seed = theoremId * 101 + burstId * 37 + i;
      const angle = direction + hash01(i, seed) * TAU;
      const speed = 0.35 + hash01(i, seed + 9) * (0.8 + strength * 0.8);
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: performance.now(),
        life: 360 + hash01(i, seed + 19) * 520,
        size: 0.45 + hash01(i, seed + 23) * 0.9,
      });
    }
    if (sparksRef.current.length > MAX_SPARKS) {
      sparksRef.current.splice(0, sparksRef.current.length - MAX_SPARKS);
    }
  }, [profile.sparkBudget, theoremId]);

  const handlePointerMove = useCallback((event) => {
    const point = localPoint(event);
    if (!point) return;

    const pointer = pointerRef.current;
    const first = pointer.lastX < -500;
    const dx = first ? 0 : point.x - pointer.lastX;
    const dy = first ? 0 : point.y - pointer.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!first) {
      const prevAngle = Math.atan2(pointer.lastY - point.cy, pointer.lastX - point.cx);
      const nextAngle = Math.atan2(point.y - point.cy, point.x - point.cx);
      const delta = normalizeAngle(nextAngle - prevAngle);
      pointer.rotationIntent = clamp(pointer.rotationIntent * 0.72 + delta * 3.8, -1, 1);
    }

    pointer.x = point.x;
    pointer.y = point.y;
    pointer.lastX = point.x;
    pointer.lastY = point.y;
    pointer.pointerType = event.pointerType || pointer.pointerType;
    pointer.pressure = event.pressure || (pointer.down ? 0.5 : 0);
    pointer.speed = pointer.speed * 0.58 + Math.min(3, distance / 10) * 0.42;
    pointer.energy = Math.min(1, pointer.energy + 0.08 + Math.min(distance, 30) / 90);
    pointer.active = true;

    if (pointer.down && distance > 5) {
      const now = performance.now();
      if (now - pointer.lastRippleAt > 72) {
        addRipple(point.x, point.y, 0.34 + Math.min(pointer.speed, 2) * 0.16);
        pointer.lastRippleAt = now;
      }
    }

    setMirrorFocus(point.x, point.y, true, pointer.down);
  }, [addRipple, localPoint, setMirrorFocus]);

  const handlePointerDown = useCallback((event) => {
    const point = localPoint(event);
    if (!point) return;
    const pointer = pointerRef.current;
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.lastX = point.x;
    pointer.lastY = point.y;
    pointer.active = true;
    pointer.down = true;
    pointer.pointerType = event.pointerType || 'mouse';
    pointer.pressure = event.pressure || 0.5;
    pointer.energy = Math.min(1, pointer.energy + 0.45);
    pointer.speed = 0;
    pointer.rotationIntent *= 0.5;
    pointer.holdStartedAt = performance.now();
    pointer.operative = false;
    pointer.operativeCharge = 0;
    pointer.releaseImpulse = 0;
    pointer.lastRippleAt = pointer.holdStartedAt;
    addRipple(point.x, point.y, 1);
    addSparkBurst(point.x, point.y, 0.45);
    setMirrorFocus(point.x, point.y, true, true);
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* capture is optional */ }
  }, [addRipple, addSparkBurst, localPoint, setMirrorFocus]);

  const handlePointerUp = useCallback((event) => {
    const pointer = pointerRef.current;
    const charge = pointer.operativeCharge;
    const wasOperative = pointer.operative || charge >= 0.2;
    const now = performance.now();

    pointer.down = false;
    pointer.pressure = 0;
    pointer.energy = Math.min(1, pointer.energy + 0.12 + charge * 0.25);
    pointer.releaseImpulse = Math.max(pointer.releaseImpulse, charge * spec.operative.releaseGain);
    pointer.resolutionUntil = wasOperative ? now + 1150 : pointer.resolutionUntil;
    pointer.operative = false;

    if (wasOperative) {
      addRipple(pointer.x, pointer.y, 1.1 + charge * 1.2);
      addSparkBurst(pointer.x, pointer.y, 0.8 + charge, pointer.rotationIntent * Math.PI);
      const memory = recordMirrorOperation({
        theoremId,
        field: spec.field,
        charge,
        direction: pointer.rotationIntent,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('monas:mirror-operation', {
          detail: {
            theoremId,
            field: spec.field,
            mode: spec.operative.mode,
            charge,
            direction: pointer.rotationIntent,
            tone: spec.tone,
            totalOperations: memory?.totalOperations || null,
          },
        }));
      }
    }

    const keepHover = (event.pointerType || pointer.pointerType) === 'mouse';
    pointer.active = keepHover;
    if (!keepHover) {
      pointer.lastX = -1000;
      pointer.lastY = -1000;
    }
    setMirrorFocus(pointer.x, pointer.y, keepHover, false);
    try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch { /* release is optional */ }
  }, [addRipple, addSparkBurst, setMirrorFocus, spec, theoremId]);

  const handlePointerLeave = useCallback(() => {
    const pointer = pointerRef.current;
    if (pointer.down) return;
    pointer.active = false;
    pointer.speed = 0;
    pointer.lastX = -1000;
    pointer.lastY = -1000;
    setMirrorFocus(pointer.x, pointer.y, false, false);
  }, [setMirrorFocus]);

  const handlePointerCancel = useCallback(() => {
    const pointer = pointerRef.current;
    pointer.active = false;
    pointer.down = false;
    pointer.operative = false;
    pointer.operativeCharge = 0;
    pointer.pressure = 0;
    pointer.speed = 0;
    pointer.lastX = -1000;
    pointer.lastY = -1000;
    setMirrorFocus(pointer.x, pointer.y, false, false);
  }, [setMirrorFocus]);

  useEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return undefined;
    mirror.dataset.field = spec.field;
    mirror.dataset.mode = spec.operative.mode;
    mirror.style.setProperty('--mirror-caustic', String(spec.optics.caustic));
    mirror.style.setProperty('--mirror-engraving', String(spec.optics.engraving));
    mirror.style.setProperty('--mirror-chroma', String(spec.optics.chroma));
    mirror.style.setProperty('--mirror-depth', String(spec.optics.depth));
    mirror.style.setProperty('--mirror-skeleton', String(spec.optics.skeleton));
    mirror.style.setProperty('--manifestation-rate', String(spec.motion.fieldRate));
    document.documentElement.style.setProperty('--manifestation-holo-seconds', `${spec.motion.hologramSeconds}s`);
    document.documentElement.style.setProperty('--manifestation-field-rate', String(spec.motion.fieldRate));
  }, [spec]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mirror = mirrorRef.current;
    if (!canvas || !mirror) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const palette = getPalette(theoremId);
    mirror.style.setProperty('--mirror-primary', palette[0] || 'var(--ink-gold)');
    mirror.style.setProperty('--mirror-secondary', palette[1] || 'var(--ink-red)');
    mirror.style.setProperty('--mirror-tertiary', palette[2] || palette[0] || 'var(--ink-gold)');

    const particleCount = profile.particleBudget;
    const initialRect = mirror.getBoundingClientRect();
    let width = Math.max(1, initialRect.width);
    let height = Math.max(1, initialRect.height);
    let center = { x: width / 2, y: height / 2 };
    let baseRadius = Math.min(width, height) * (width < 300 ? 0.27 : 0.285);
    let anchors = [];
    let skeletonSegments = [];
    let frameCount = 0;
    let lastTime = performance.now();
    let frameEma = 16.7;
    let degraded = false;

    class Particle {
      constructor(index) {
        this.index = index;
        this.role = particleRole(index, theoremId);
        this.phase = hash01(index, theoremId + 17) * TAU;
        this.x = center.x + (hash01(index, theoremId + 1) - 0.5) * 18;
        this.y = center.y + (hash01(index, theoremId + 2) - 0.5) * 18;
        this.tx = center.x;
        this.ty = center.y;
        this.vx = 0;
        this.vy = 0;
        const roleScale = this.role === 'singularity' ? 1.45 : this.role === 'aether' ? 0.68 : 1;
        this.size = (0.42 + hash01(index, theoremId + 5) * (profile.touchFirst ? 0.92 : 0.72)) * roleScale;
        this.color = palette[index % palette.length] || '#ffffff';
        this.springVariance = 0.78 + hash01(index, theoremId + 11) * 0.44;
      }

      setTarget() {
        const baseTarget = targetForParticle(currentShape, this.index, particleCount, center.x, center.y, baseRadius, theoremId);
        const target = roleTarget(this.role, baseTarget, this.index, theoremId, baseRadius, anchors);
        this.tx = target.x;
        this.ty = target.y;
      }

      update(now) {
        const pointer = pointerRef.current;
        const roleSpring = this.role === 'singularity' ? 1.55 : this.role === 'aether' ? 0.46 : 1;
        const dynamic = dynamicTarget(this, spec, now, center, pointer);
        const operativeLock = ['axis-lock', 'crystallize', 'facet-lock'].includes(spec.operative.mode)
          ? 1 + pointer.operativeCharge * 0.8
          : 1;
        const spring = spec.physics.spring * this.springVariance * roleSpring * operativeLock;
        this.vx += (dynamic.x - this.x) * spring;
        this.vy += (dynamic.y - this.y) * spring;

        applyFieldLaw(this, spec, now, center, pointer);
        applyPointerField(this, pointer, spec);
        applyRippleField(this, ripplesRef.current, spec, now);

        this.vx *= spec.physics.damping;
        this.vy *= spec.physics.damping;

        const driftBase = profile.reducedMotion ? 0.035 : spec.physics.drift;
        const drift = this.role === 'aether' ? driftBase * 1.8 : this.role === 'singularity' ? driftBase * 0.35 : driftBase;
        this.x += this.vx + Math.sin(now * 0.001 + this.phase) * drift;
        this.y += this.vy + Math.cos(now * 0.0013 + this.phase) * drift;
      }

      draw(skipAether = false) {
        if (skipAether && this.role === 'aether' && this.index % 2 === 0) return;
        const alpha = this.role === 'aether' ? 0.48 : this.role === 'singularity' ? 0.96 : 0.78;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        if (profile.enableParticleGlow && this.role !== 'aether') {
          ctx.shadowBlur = this.role === 'singularity' ? 8 : 5;
          ctx.shadowColor = this.color;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, TAU);
        ctx.fill();
        if (profile.enableParticleGlow && this.role !== 'aether') ctx.shadowBlur = 0;

        if (this.role === 'singularity') {
          ctx.globalAlpha = 0.2 + pointerRef.current.operativeCharge * 0.25;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.45;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size + 2.2, 0, TAU);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }

    const setAllTargets = () => {
      particlesRef.current.forEach((particle) => particle.setTarget());
    };

    const resize = () => {
      const rect = mirror.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      center = { x: width / 2, y: height / 2 };
      baseRadius = Math.min(width, height) * (width < 300 ? 0.27 : 0.285);
      anchors = singularityAnchors(currentShape, center.x, center.y, baseRadius);
      skeletonSegments = buildSkeletonSegments(
        currentShape,
        center.x,
        center.y,
        baseRadius,
        theoremId,
        profile.skeletonSamples || 240,
      );
      setAllTargets();
    };

    particlesRef.current = Array.from({ length: particleCount }, (_, index) => new Particle(index));
    resize();

    const drawSkeleton = (now) => {
      const pointer = pointerRef.current;
      const parallaxX = pointer.active ? (pointer.x - center.x) * -0.012 * spec.optics.depth : 0;
      const parallaxY = pointer.active ? (pointer.y - center.y) * -0.012 * spec.optics.depth : 0;
      const alpha = clamp(spec.optics.skeleton + pointer.operativeCharge * 0.09, 0.05, 0.38);

      ctx.save();
      ctx.translate(parallaxX, parallaxY);
      ctx.strokeStyle = palette[0] || '#ffdf73';
      ctx.lineWidth = 0.42 + pointer.operativeCharge * 0.18;
      ctx.globalAlpha = alpha;
      if (profile.enableParticleGlow && !degraded) {
        ctx.shadowBlur = 4 + pointer.operativeCharge * 4;
        ctx.shadowColor = palette[0] || '#ffdf73';
      }
      for (const segment of skeletonSegments) {
        if (segment.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(segment[0].x, segment[0].y);
        for (let i = 1; i < segment.length; i += 1) ctx.lineTo(segment[i].x, segment[i].y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      ctx.fillStyle = palette[1] || palette[0] || '#ffffff';
      ctx.globalAlpha = alpha * (0.58 + 0.24 * Math.sin(now * 0.0012));
      for (const anchor of anchors) {
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 0.85 + pointer.operativeCharge * 0.65, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      const maxDistSq = Math.pow(Math.min(width, height) * 0.105, 2);
      const step = profile.lineStep * (degraded ? 2 : 1);
      const stepJ = profile.lineStepJ * (degraded ? 2 : 1);
      for (let i = 0; i < particles.length; i += step) {
        if (particles[i].role === 'aether') continue;
        for (let j = i + stepJ; j < particles.length; j += stepJ) {
          if (particles[j].role === 'aether') continue;
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          if (dx * dx + dy * dy < maxDistSq) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();
    };

    const drawRipples = (now) => {
      if (!profile.enableRipples) return;
      ripplesRef.current = ripplesRef.current.filter((ripple) => now - ripple.born < 1150);
      for (const ripple of ripplesRef.current) {
        const age = now - ripple.born;
        const progress = age / 1150;
        const radius = 8 + age * spec.physics.rippleSpeed;
        const alpha = (1 - progress) * 0.3 * ripple.strength;
        ctx.strokeStyle = palette[Math.floor(progress * palette.length) % palette.length] || '#ffdf73';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.7 + ripple.strength * 0.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawSparks = (now) => {
      sparksRef.current = sparksRef.current.filter((spark) => now - spark.born < spark.life);
      for (let i = 0; i < sparksRef.current.length; i += 1) {
        const spark = sparksRef.current[i];
        const age = now - spark.born;
        const progress = age / spark.life;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.965;
        spark.vy *= 0.965;
        ctx.globalAlpha = (1 - progress) * 0.68;
        ctx.fillStyle = palette[i % palette.length] || '#ffffff';
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * (1 - progress * 0.45), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawContact = (now) => {
      const pointer = pointerRef.current;
      if (!pointer.active && now >= pointer.resolutionUntil) return;
      const energy = clamp(pointer.energy, 0, 1);
      ctx.fillStyle = palette[0] || '#ffdf73';
      ctx.globalAlpha = 0.34 + energy * 0.25;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.down ? 2.8 : 1.8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = palette[1] || '#ff4444';
      ctx.globalAlpha = 0.14 + energy * 0.24;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 8 + energy * 8, 0, TAU);
      ctx.stroke();

      if (pointer.down) {
        const heldFor = Math.max(0, now - pointer.holdStartedAt);
        const preCharge = clamp(heldFor / Math.max(1, spec.operative.holdMs), 0, 1);
        const charge = pointer.operative ? pointer.operativeCharge : preCharge * 0.22;
        ctx.globalAlpha = 0.2 + charge * 0.55;
        ctx.strokeStyle = palette[2] || palette[0] || '#ffdf73';
        ctx.lineWidth = 0.9 + charge * 0.8;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 13 + charge * 10, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.08, charge));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const dispatchMirrorState = (now) => {
      const pointer = pointerRef.current;
      if (typeof window === 'undefined') return;
      if (now - pointer.lastDispatchAt < 180) return;
      if (pointer.energy < 0.025 && pointer.operativeCharge < 0.02) return;
      pointer.lastDispatchAt = now;
      window.dispatchEvent(new CustomEvent('monas:mirror-state', {
        detail: {
          theoremId,
          field: spec.field,
          mode: spec.operative.mode,
          energy: pointer.energy,
          charge: pointer.operativeCharge,
          direction: pointer.rotationIntent,
          tone: spec.tone,
        },
      }));
    };

    const animate = (now) => {
      const dt = Math.min(40, now - lastTime);
      lastTime = now;
      frameCount += 1;
      frameEma = frameEma * 0.94 + dt * 0.06;
      if (frameCount % 45 === 0) {
        if (frameEma > 24) degraded = true;
        else if (frameEma < 19.5) degraded = false;
        mirror.dataset.quality = degraded ? 'reduced' : 'full';
      }

      const pointer = pointerRef.current;
      if (pointer.down) {
        const heldFor = Math.max(0, now - pointer.holdStartedAt);
        if (heldFor >= spec.operative.holdMs) {
          pointer.operative = true;
          const targetCharge = clamp((heldFor - spec.operative.holdMs) / Math.max(1, spec.operative.chargeMs), 0, 1);
          pointer.operativeCharge += (targetCharge - pointer.operativeCharge) * 0.095;
        } else {
          pointer.operativeCharge *= 0.86;
        }
      } else {
        pointer.operativeCharge *= 0.93;
      }

      pointer.energy *= Math.pow(spec.physics.energyDecay, dt / 16.67);
      pointer.releaseImpulse *= Math.pow(0.91, dt / 16.67);
      pointer.speed *= 0.9;
      pointer.rotationIntent *= pointer.down ? 0.985 : 0.94;

      mirror.style.setProperty('--mirror-energy', pointer.energy.toFixed(3));
      mirror.style.setProperty('--mirror-operative', pointer.operativeCharge.toFixed(3));
      mirror.dataset.operative = pointer.operative ? 'true' : 'false';
      mirror.dataset.resolving = now < pointer.resolutionUntil ? 'true' : 'false';

      ctx.globalCompositeOperation = 'source-over';
      const fadeAlpha = profile.reducedMotion ? 0.56 : degraded ? 0.34 : 0.27;
      const background = ctx.createRadialGradient(
        center.x + (pointer.active ? (pointer.x - center.x) * 0.025 : 0),
        center.y + (pointer.active ? (pointer.y - center.y) * 0.025 : 0),
        Math.min(width, height) * 0.05,
        center.x,
        center.y,
        Math.min(width, height) * 0.56,
      );
      background.addColorStop(0, `rgba(7,6,8,${Math.max(0.18, fadeAlpha - 0.08)})`);
      background.addColorStop(0.58, `rgba(1,1,2,${fadeAlpha})`);
      background.addColorStop(1, `rgba(0,0,0,${Math.min(0.72, fadeAlpha + 0.2)})`);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      drawSkeleton(now);
      const connectionEvery = profile.connectionEvery * (degraded ? 2 : 1);
      if (frameCount % connectionEvery === 0) drawConnections();

      ctx.globalCompositeOperation = 'lighter';
      particlesRef.current.forEach((particle) => {
        particle.update(now);
        particle.draw(degraded);
      });
      drawSparks(now);
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(now);
      drawContact(now);
      dispatchMirrorState(now);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    let resizeRaf = 0;
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          cancelAnimationFrame(resizeRaf);
          resizeRaf = requestAnimationFrame(resize);
        })
      : null;
    observer?.observe(mirror);

    return () => {
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(resizeRaf);
      observer?.disconnect();
      ripplesRef.current = [];
      sparksRef.current = [];
    };
  }, [
    currentShape,
    profile.connectionEvery,
    profile.dprCap,
    profile.enableParticleGlow,
    profile.enableRipples,
    profile.key,
    profile.lineStep,
    profile.lineStepJ,
    profile.particleBudget,
    profile.reducedMotion,
    profile.skeletonSamples,
    profile.touchFirst,
    spec,
    theoremId,
  ]);

  return (
    <div
      ref={mirrorRef}
      className="scrying-mirror living-black-mirror"
      data-field={spec.field}
      data-mode={spec.operative.mode}
      data-active="false"
      data-pressing="false"
      data-operative="false"
      data-resolving="false"
      data-quality="full"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label={`Interactive scrying mirror for Theorem ${theoremId}. Trace to disturb the ${spec.field} field; hold to enter its ${spec.operative.mode} operation.`}
    >
      <div className="mirror-depth-volume" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="mirror-inner-rim" aria-hidden="true" />
    </div>
  );
}
