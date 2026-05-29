import React, { useRef, useEffect, useCallback } from 'react';
import { getPalette } from '../data/palettes.js';

// The 2D scrying mirror: ~450 particles that flock into the theorem's shape and
// scatter from the cursor like iron filings around a lodestone. Retained as the
// lightweight, always-available illustration (and as the WebGL fallback for the
// flagship MonadOrb on weak devices / reduced-motion).
export default function ParticleSigil({ currentShape, theoremId }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const baseRadius = canvas.width < 300 ? 70 : 90;

    class Particle {
      constructor(i) {
        this.index = i;
        this.x = cx + (Math.random() * 20 - 10);
        this.y = cy + (Math.random() * 20 - 10);
        this.tx = cx;
        this.ty = cy;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 0.8 + 0.3;
        this.baseColor = '#ffffff';
        this.speed = Math.random() * 0.05 + 0.02;
      }
      update(t, mouse) {
        this.vx += (this.tx - this.x) * this.speed * 0.08;
        this.vy += (this.ty - this.y) * this.speed * 0.08;
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          const force = (60 - dist) / 60;
          this.vx += (dx / dist) * force * 2;
          this.vy += (dy / dist) * force * 2;
        }
        this.vx *= 0.82;
        this.vy *= 0.82;
        this.x += this.vx + Math.sin(t * 0.001 + this.index) * 0.2;
        this.y += this.vy + Math.cos(t * 0.0015 + this.index) * 0.2;
      }
      draw(c) {
        c.fillStyle = this.baseColor;
        c.shadowBlur = 6;
        c.shadowColor = this.baseColor;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.shadowBlur = 0;
      }
    }

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 450; i++) particlesRef.current.push(new Particle(i));
    }

    const currentPalette = getPalette(theoremId);
    particlesRef.current.forEach((p, i) => {
      p.baseColor = currentPalette[i % currentPalette.length];
    });

    const setTargets = (s) => {
      particlesRef.current.forEach((p, i) => {
        const r = i / particlesRef.current.length;
        if (s === 'line-circle') {
          if (r < 0.6) { const a = (r / 0.6) * Math.PI * 2; p.tx = cx + Math.cos(a) * baseRadius; p.ty = cy + Math.sin(a) * baseRadius; }
          else { p.tx = cx; p.ty = cy + (((r - 0.6) / 0.4) - 0.5) * (baseRadius * 2.5); }
        } else if (s === 'point-line-circle') {
          if (r < 0.1) { const a = Math.random() * Math.PI * 2; const d = Math.random() * 3; p.tx = cx + Math.cos(a) * d; p.ty = cy + Math.sin(a) * d; }
          else if (r < 0.5) { const h = ((r - 0.1) / 0.4); p.tx = cx; p.ty = cy - (h * baseRadius * 1.5); }
          else { const a = ((r - 0.5) / 0.5) * Math.PI * 2; p.tx = cx + Math.cos(a) * (baseRadius * 0.9); p.ty = cy + Math.sin(a) * (baseRadius * 0.9); }
        } else if (s === 'sun-earth') {
          const a = r * Math.PI * 2; const d = r < 0.15 ? Math.random() * 4 : baseRadius + (Math.random() * 4 - 2); p.tx = cx + Math.cos(a) * d; p.ty = cy + Math.sin(a) * d;
        } else if (s === 'sun-moon') {
          if (r < 0.5) { const a = r / 0.5 * Math.PI * 2; p.tx = cx + Math.cos(a) * (baseRadius * 0.9); p.ty = cy + Math.sin(a) * (baseRadius * 0.9); }
          else { const a = Math.PI + (r - 0.5) / 0.5 * Math.PI; p.tx = cx + Math.cos(a) * (baseRadius * 0.75); p.ty = cy - (baseRadius * 0.8) + Math.sin(a) * (baseRadius * 0.75); }
        } else if (s === 'cross-rotated' || s === 'cross-quaternary') {
          const r2 = r * 2;
          if (r2 < 1) { p.tx = cx + (r2 - 0.5) * baseRadius * 2; p.ty = cy + (r2 - 0.5) * baseRadius * 2; }
          else { p.tx = cx + ((r2 - 1) - 0.5) * baseRadius * 2; p.ty = cy - ((r2 - 1) - 0.5) * baseRadius * 2; }
        } else if (s === 'triangle-fire') {
          if (r < 0.33) { p.tx = cx - baseRadius + (r / 0.33) * baseRadius * 2; p.ty = cy + baseRadius; }
          else if (r < 0.66) { const rat = (r - 0.33) / 0.33; p.tx = cx + baseRadius - rat * baseRadius; p.ty = cy + baseRadius - rat * baseRadius * 2; }
          else { const rat = (r - 0.66) / 0.34; p.tx = cx - rat * baseRadius; p.ty = cy - baseRadius + rat * baseRadius * 2; }
        } else if (s === 'square-circle') {
          if (r < 0.5) { const a = (r / 0.5) * Math.PI * 2; p.tx = cx + Math.cos(a) * baseRadius; p.ty = cy + Math.sin(a) * baseRadius; }
          else {
            const edge = (r - 0.5) / 0.5 * 4; const rat = edge % 1; const rad = baseRadius * 0.9;
            if (edge < 1) { p.tx = cx - rad + rat * (rad * 2); p.ty = cy - rad; }
            else if (edge < 2) { p.tx = cx + rad; p.ty = cy - rad + rat * (rad * 2); }
            else if (edge < 3) { p.tx = cx + rad - rat * (rad * 2); p.ty = cy + rad; }
            else { p.tx = cx - rad; p.ty = cy + rad - rat * (rad * 2); }
          }
        } else if (s === 'aries-cross') {
          if (r < 0.4) { p.tx = cx; p.ty = cy + ((r / 0.4) - 0.5) * baseRadius * 2; }
          else if (r < 0.7) { p.tx = cx + (((r - 0.4) / 0.3) - 0.5) * baseRadius * 2; p.ty = cy; }
          else { const a = Math.PI + ((r - 0.7) / 0.3) * Math.PI; p.tx = cx + Math.cos(a) * 40; p.ty = cy - baseRadius - 20 + Math.abs(Math.sin(a) * 40); }
        } else if (s === 'metatron') {
          const a = r * Math.PI * 2; const d = Math.random() * baseRadius * 1.5; p.tx = cx + Math.cos(a) * d; p.ty = cy + Math.sin(a) * d;
        } else if (s === 'icosahedron') {
          const band = Math.floor(r * 5); const a = r * Math.PI * 2 * 3; p.tx = cx + Math.cos(a) * (baseRadius * (band / 5)); p.ty = cy + Math.sin(a) * (baseRadius * (band / 5));
        } else if (s === 'torus') {
          const u = r * Math.PI * 2 * 5; const v = r * Math.PI * 2; p.tx = cx + (baseRadius + 20 * Math.cos(v)) * Math.cos(u); p.ty = cy + (baseRadius + 20 * Math.cos(v)) * Math.sin(u);
        } else if (s === 'sri-yantra' || s === 'pentagram' || s === 'sacred-252') {
          if (r < 0.5) { p.tx = cx + (r - 0.25) * baseRadius * 3; p.ty = cy + Math.abs(r - 0.25) * baseRadius * 3; }
          else { p.tx = cx + (r - 0.75) * baseRadius * 3; p.ty = cy - Math.abs(r - 0.75) * baseRadius * 3; }
        } else if (s === 'monad-full') {
          if (r < 0.2) { const a = (r / 0.2) * Math.PI * 2; p.tx = cx + Math.cos(a) * 30; p.ty = cy - 30 + Math.sin(a) * 30; }
          else if (r < 0.4) { p.tx = cx; p.ty = cy + ((r - 0.2) / 0.2) * 80; }
          else if (r < 0.6) { p.tx = cx - 40 + ((r - 0.4) / 0.2) * 80; p.ty = cy + 40; }
          else { const a = Math.PI + ((r - 0.6) / 0.4) * Math.PI; p.tx = cx + Math.cos(a) * 30; p.ty = cy + 70 + Math.abs(Math.sin(a) * 30); }
        } else if (s === 'hermetic-egg') {
          const a = r * Math.PI * 2; p.tx = cx + Math.cos(a) * baseRadius * 0.8; p.ty = cy + Math.sin(a) * baseRadius * 1.2;
        } else if (s === 'sephiroth') {
          p.tx = cx + (Math.random() - 0.5) * baseRadius * 1.5; p.ty = cy + (Math.random() - 0.5) * baseRadius * 2;
        } else if (s === 'albedo-rubedo') {
          if (r < 0.5) { const a = (r / 0.5) * Math.PI * 2; p.tx = cx - 20 + Math.cos(a) * baseRadius * 0.8; p.ty = cy + Math.sin(a) * baseRadius * 0.8; }
          else { const a = ((r - 0.5) / 0.5) * Math.PI * 2; p.tx = cx + 20 + Math.cos(a) * baseRadius * 0.8; p.ty = cy + Math.sin(a) * baseRadius * 0.8; }
        } else if (s === 'radiance') {
          const a = r * Math.PI * 2; const d = Math.random() * baseRadius * 2; p.tx = cx + Math.cos(a) * d; p.ty = cy + Math.sin(a) * d;
        } else if (s === 'hypercube-stone') {
          const band = Math.floor(r * 4);
          if (band === 0) { p.tx = cx - 30 + (r * 4) * 60; p.ty = cy - 30; }
          else if (band === 1) { p.tx = cx + 30; p.ty = cy - 30 + ((r - 0.25) * 4) * 60; }
          else if (band === 2) { p.tx = cx + 30 - ((r - 0.5) * 4) * 60; p.ty = cy + 30; }
          else { p.tx = cx - 30; p.ty = cy + 30 - ((r - 0.75) * 4) * 60; }
        } else if (s === 'infinite-spiral') {
          const a = r * Math.PI * 2 * 6; const d = r * baseRadius * 1.5; p.tx = cx + Math.cos(a) * d; p.ty = cy + Math.sin(a) * d;
        } else {
          p.tx = r < 0.5 ? cx : cx + (r - 0.75) * (baseRadius * 2.3); p.ty = r < 0.5 ? cy + (r - 0.25) * (baseRadius * 2.3) : cy;
        }
      });
    };

    setTargets(currentShape);

    let frame = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const p = particlesRef.current;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      for (let i = 0; i < p.length; i += 5) {
        for (let j = i + 1; j < p.length; j += 6) {
          const dx = p[i].x - p[j].x;
          const dy = p[i].y - p[j].y;
          if (dx * dx + dy * dy < 1000) { ctx.moveTo(p[i].x, p[i].y); ctx.lineTo(p[j].x, p[j].y); }
        }
      }
      ctx.stroke();

      ctx.globalCompositeOperation = 'lighter';
      p.forEach((particle) => { particle.update(frame, mouseRef.current); particle.draw(ctx); });
      ctx.globalCompositeOperation = 'source-over';

      if (mouseRef.current.x > 0) {
        ctx.fillStyle = 'rgba(255, 223, 115, 0.6)'; ctx.beginPath(); ctx.arc(mouseRef.current.x, mouseRef.current.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.4)'; ctx.beginPath(); ctx.arc(mouseRef.current.x, mouseRef.current.y, 10, 0, Math.PI * 2); ctx.stroke();
      }
      animationRef.current = requestAnimationFrame(animate);
      frame += 16;
    };
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [currentShape, theoremId]);

  return (
    <div
      className="scrying-mirror"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); mouseRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }; }}
      onTouchEnd={handleMouseLeave}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
