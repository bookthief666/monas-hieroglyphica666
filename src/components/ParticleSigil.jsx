import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { getPalette } from '../data/palettes.js';
import { getManifestationSpec } from '../lib/manifestationSpec.js';
import { hash01, targetForParticle } from '../lib/particleGeometry.js';
import useDeviceProfile from '../lib/useDeviceProfile.js';

const TAU = Math.PI * 2;
const EPSILON = 0.0001;
const MAX_RIPPLES = 7;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

  switch (spec.field) {
    case 'solar':
    case 'radial':
    case 'radiant': {
      const pulse = Math.sin(phase * 1.7) * 0.0045 * (1 + energy * 1.8);
      particle.vx += nx * pulse * dist;
      particle.vy += ny * pulse * dist;
      break;
    }
    case 'lunar': {
      const lens = Math.sin(phase) * 0.012 * (0.4 + energy);
      particle.vx += -ny * lens;
      particle.vy += nx * lens * 0.65;
      break;
    }
    case 'stellar': {
      const pulse = Math.sin(phase * 2.2) * 0.008 * (0.5 + energy);
      particle.vx += nx * pulse;
      particle.vy += ny * pulse;
      break;
    }
    case 'vortex':
    case 'toroidal':
    case 'spiral': {
      const spin = 0.0075 * spec.motion.fieldRate * (0.35 + energy * 1.6);
      particle.vx += -ny * spin;
      particle.vy += nx * spin;
      if (spec.field === 'spiral') {
        const breathe = Math.sin(phase * 1.35) * 0.0035;
        particle.vx += nx * breathe;
        particle.vy += ny * breathe;
      }
      break;
    }
    case 'harmonic': {
      particle.vy += Math.sin(phase * 2 + particle.index * 0.04) * 0.006 * (0.5 + energy);
      break;
    }
    case 'egg': {
      particle.vx += Math.sin(phase) * 0.0025;
      particle.vy += Math.cos(phase * 0.7) * 0.0035;
      break;
    }
    case 'monadic': {
      const inward = 0.0025 * (0.5 + energy);
      particle.vx -= nx * inward;
      particle.vy -= ny * inward;
      break;
    }
    case 'hypercube': {
      const depth = Math.sin(phase + (particle.index % 4) * Math.PI / 2) * 0.004;
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

  const radial = pointer.down
    ? -spec.physics.holdForce * pressure
    : spec.physics.traceForce * (0.85 + Math.min(pointer.speed, 2.5) * 0.28);

  particle.vx += nx * radial * falloff;
  particle.vy += ny * radial * falloff;

  const tangent = spec.physics.swirl * falloff * (0.35 + Math.min(pointer.speed, 3));
  particle.vx += -ny * tangent;
  particle.vy += nx * tangent;
}

function applyRippleField(particle, ripples, spec, now) {
  for (const ripple of ripples) {
    const age = now - ripple.born;
    if (age < 0 || age > 1050) continue;

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
    const decay = 1 - age / 1050;
    const force = spec.physics.rippleForce * ripple.strength * envelope * decay * 0.11;
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
  });

  const profile = useDeviceProfile();
  const spec = useMemo(() => getManifestationSpec(theoremId, currentShape), [theoremId, currentShape]);

  const setMirrorFocus = useCallback((x, y, active, pressing = false) => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const rect = mirror.getBoundingClientRect();
    const px = rect.width > 0 ? clamp((x / rect.width) * 100, 0, 100) : 50;
    const py = rect.height > 0 ? clamp((y / rect.height) * 100, 0, 100) : 50;
    mirror.style.setProperty('--mirror-x', `${px}%`);
    mirror.style.setProperty('--mirror-y', `${py}%`);
    mirror.dataset.active = active ? 'true' : 'false';
    mirror.dataset.pressing = pressing ? 'true' : 'false';
  }, []);

  const localPoint = useCallback((event) => {
    const mirror = mirrorRef.current;
    if (!mirror) return null;
    const rect = mirror.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const addRipple = useCallback((x, y, strength = 1) => {
    if (!profile.enableRipples) return;
    const ripples = ripplesRef.current;
    ripples.push({ x, y, born: performance.now(), strength });
    if (ripples.length > MAX_RIPPLES) ripples.splice(0, ripples.length - MAX_RIPPLES);
  }, [profile.enableRipples]);

  const handlePointerMove = useCallback((event) => {
    const point = localPoint(event);
    if (!point) return;

    const pointer = pointerRef.current;
    const first = pointer.lastX < -500;
    const dx = first ? 0 : point.x - pointer.lastX;
    const dy = first ? 0 : point.y - pointer.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

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
    pointer.lastRippleAt = performance.now();
    addRipple(point.x, point.y, 1);
    setMirrorFocus(point.x, point.y, true, true);
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* capture is optional */ }
  }, [addRipple, localPoint, setMirrorFocus]);

  const handlePointerUp = useCallback((event) => {
    const pointer = pointerRef.current;
    pointer.down = false;
    pointer.pressure = 0;
    pointer.energy = Math.min(1, pointer.energy + 0.12);
    const keepHover = (event.pointerType || pointer.pointerType) === 'mouse';
    pointer.active = keepHover;
    if (!keepHover) {
      pointer.lastX = -1000;
      pointer.lastY = -1000;
    }
    setMirrorFocus(pointer.x, pointer.y, keepHover, false);
    try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch { /* release is optional */ }
  }, [setMirrorFocus]);

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
    mirror.style.setProperty('--mirror-caustic', String(spec.optics.caustic));
    mirror.style.setProperty('--mirror-engraving', String(spec.optics.engraving));
    mirror.style.setProperty('--mirror-chroma', String(spec.optics.chroma));
    mirror.style.setProperty('--manifestation-rate', String(spec.motion.fieldRate));
    document.documentElement.style.setProperty('--manifestation-holo-seconds', `${spec.motion.hologramSeconds}s`);
    document.documentElement.style.setProperty('--manifestation-field-rate', String(spec.motion.fieldRate));
  }, [spec.field, spec.motion.fieldRate, spec.motion.hologramSeconds, spec.optics.caustic, spec.optics.chroma, spec.optics.engraving]);

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
    let frameCount = 0;
    let lastTime = performance.now();

    class Particle {
      constructor(index) {
        this.index = index;
        this.phase = hash01(index, theoremId + 17) * TAU;
        this.x = center.x + (hash01(index, theoremId + 1) - 0.5) * 18;
        this.y = center.y + (hash01(index, theoremId + 2) - 0.5) * 18;
        this.tx = center.x;
        this.ty = center.y;
        this.vx = 0;
        this.vy = 0;
        this.size = 0.42 + hash01(index, theoremId + 5) * (profile.touchFirst ? 0.92 : 0.72);
        this.color = palette[index % palette.length] || '#ffffff';
        this.springVariance = 0.78 + hash01(index, theoremId + 11) * 0.44;
      }

      setTarget() {
        const target = targetForParticle(currentShape, this.index, particleCount, center.x, center.y, baseRadius, theoremId);
        this.tx = target.x;
        this.ty = target.y;
      }

      update(now) {
        const pointer = pointerRef.current;
        const spring = spec.physics.spring * this.springVariance;
        this.vx += (this.tx - this.x) * spring;
        this.vy += (this.ty - this.y) * spring;

        applyFieldLaw(this, spec, now, center, pointer);
        applyPointerField(this, pointer, spec);
        applyRippleField(this, ripplesRef.current, spec, now);

        this.vx *= spec.physics.damping;
        this.vy *= spec.physics.damping;

        const drift = profile.reducedMotion ? 0.035 : spec.physics.drift;
        this.x += this.vx + Math.sin(now * 0.001 + this.phase) * drift;
        this.y += this.vy + Math.cos(now * 0.0013 + this.phase) * drift;
      }

      draw() {
        ctx.fillStyle = this.color;
        if (profile.enableParticleGlow) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = this.color;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, TAU);
        ctx.fill();
        if (profile.enableParticleGlow) ctx.shadowBlur = 0;
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
      setAllTargets();
    };

    particlesRef.current = Array.from({ length: particleCount }, (_, index) => new Particle(index));
    resize();

    const drawConnections = () => {
      const particles = particlesRef.current;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.075)';
      ctx.lineWidth = 0.22;
      ctx.beginPath();
      const maxDistSq = Math.pow(Math.min(width, height) * 0.105, 2);
      for (let i = 0; i < particles.length; i += profile.lineStep) {
        for (let j = i + profile.lineStepJ; j < particles.length; j += profile.lineStepJ) {
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
      ripplesRef.current = ripplesRef.current.filter((ripple) => now - ripple.born < 1050);
      for (const ripple of ripplesRef.current) {
        const age = now - ripple.born;
        const progress = age / 1050;
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

    const drawContact = () => {
      const pointer = pointerRef.current;
      if (!pointer.active) return;
      const energy = clamp(pointer.energy, 0, 1);
      ctx.fillStyle = palette[0] || '#ffdf73';
      ctx.globalAlpha = 0.42 + energy * 0.26;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.down ? 2.8 : 1.8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = palette[1] || '#ff4444';
      ctx.globalAlpha = 0.16 + energy * 0.28;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 8 + energy * 8, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animate = (now) => {
      const dt = Math.min(40, now - lastTime);
      lastTime = now;
      frameCount += 1;

      const pointer = pointerRef.current;
      pointer.energy *= Math.pow(spec.physics.energyDecay, dt / 16.67);
      pointer.speed *= 0.9;
      mirror.style.setProperty('--mirror-energy', pointer.energy.toFixed(3));

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = profile.reducedMotion ? 'rgba(0,0,0,0.52)' : 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, 0, width, height);

      if (frameCount % profile.connectionEvery === 0) drawConnections();

      ctx.globalCompositeOperation = 'lighter';
      particlesRef.current.forEach((particle) => {
        particle.update(now);
        particle.draw();
      });
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(now);
      drawContact();

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
    };
  }, [currentShape, profile.connectionEvery, profile.dprCap, profile.enableParticleGlow, profile.enableRipples, profile.key, profile.lineStep, profile.lineStepJ, profile.particleBudget, profile.reducedMotion, profile.touchFirst, spec, theoremId]);

  return (
    <div
      ref={mirrorRef}
      className="scrying-mirror living-black-mirror"
      data-field={spec.field}
      data-active="false"
      data-pressing="false"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label={`Interactive scrying mirror for Theorem ${theoremId}. Trace to disturb the ${spec.field} field; press and hold to draw it inward.`}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
