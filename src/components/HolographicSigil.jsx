import React from 'react';

// The per-theorem sigil geometry. Each case is a hand-built SVG glyph whose form
// echoes the theorem's content (the line+circle of I, the Sephirothic tree of XIX,
// the infinite spiral of XXIV). Flat sigils spin in 2D; volumetric ones (9, 12, 23)
// tumble in pseudo-3D via the CSS `sigil-3d-group` keyframes.
function renderGeometry(theoremId) {
  switch (theoremId) {
    case 1:
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="2" fill="currentColor" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
        </g>
      );
    case 2:
      return (
        <g className="sigil-flat-group">
          <circle cx="35" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="65" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="2" fill="currentColor" />
        </g>
      );
    case 3:
      return (
        <g className="sigil-flat-group">
          <polygon points="50,15 85,75 15,75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 4:
      return (
        <g className="sigil-flat-group">
          <path d="M 30,50 A 25,25 0 1,0 70,50 A 15,15 0 1,1 30,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 30,50 A 25,25 0 1,1 70,50 A 15,15 0 1,0 30,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
      );
    case 5:
      return (
        <g className="sigil-flat-group">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 6:
      return (
        <g className="sigil-flat-group">
          <polygon points="50,15 80,65 20,65" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="50,85 80,35 20,35" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
      );
    case 7:
      return (
        <g className="sigil-flat-group">
          <polygon points="50,5 61,33 94,27 74,53 90,83 59,74 50,98 41,74 10,83 26,53 6,27 39,33" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="5" fill="currentColor" />
        </g>
      );
    case 8:
      return (
        <g className="sigil-flat-group">
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="28.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
      );
    case 9:
      return (
        <g className="sigil-3d-group">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="85" y1="15" x2="65" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="15" y1="85" x2="35" y2="65" stroke="currentColor" strokeWidth="1" />
          <line x1="85" y1="85" x2="65" y2="65" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 10:
      return (
        <g className="sigil-flat-group">
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 10;
            const a2 = ((i + 3) * Math.PI * 2) / 10;
            return <line key={i} x1={50 + Math.cos(a) * 40} y1={50 + Math.sin(a) * 40} x2={50 + Math.cos(a2) * 40} y2={50 + Math.sin(a2) * 40} stroke="currentColor" strokeWidth="1" />;
          })}
        </g>
      );
    case 11:
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 6;
            return <circle key={i} cx={50 + Math.cos(a) * 15} cy={50 + Math.sin(a) * 15} r="15" fill="none" stroke="currentColor" strokeWidth="1" />;
          })}
        </g>
      );
    case 12:
      return (
        <g className="sigil-3d-group">
          <polygon points="50,10 88,38 74,83 26,83 12,38" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,10 65,50 35,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
          <line x1="12" y1="38" x2="35" y2="50" stroke="currentColor" strokeWidth="1" />
          <line x1="88" y1="38" x2="65" y2="50" stroke="currentColor" strokeWidth="1" />
          <line x1="26" y1="83" x2="35" y2="50" stroke="currentColor" strokeWidth="1" />
          <line x1="74" y1="83" x2="65" y2="50" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 13:
      return (
        <g className="sigil-flat-group">
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="0.5" transform={`rotate(${i * 15} 50 50)`} />
          ))}
        </g>
      );
    case 14:
      return (
        <g className="sigil-flat-group">
          <polygon points="50,15 80,65 20,65" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,25 75,55 25,55" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,85 80,35 20,35" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="50,75 75,45 25,45" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </g>
      );
    case 15:
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="30" r="2" fill="currentColor" />
          <path d="M 35,20 A 15,15 0 0,1 65,20" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="45" x2="50" y2="85" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="65" x2="70" y2="65" stroke="currentColor" strokeWidth="2" />
          <path d="M 35,85 A 10,10 0 0,0 50,75 A 10,10 0 0,0 65,85" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      );
    case 16:
      return (
        <g className="sigil-flat-group">
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 50 50)" />
        </g>
      );
    case 17:
      return (
        <g className="sigil-flat-group">
          <polygon points="50,5 64,36 98,36 71,57 81,91 50,71 19,91 29,57 2,36 36,36" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </g>
      );
    case 18:
      return (
        <g className="sigil-flat-group">
          <ellipse cx="50" cy="55" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="70" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="20" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 19:
      return (
        <g className="sigil-flat-group">
          {[[50, 15], [30, 35], [70, 35], [50, 55], [30, 75], [70, 75], [50, 90]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="currentColor" />
          ))}
          {[[50, 15, 30, 35], [50, 15, 70, 35], [30, 35, 70, 35], [30, 35, 50, 55], [70, 35, 50, 55], [50, 55, 30, 75], [50, 55, 70, 75], [30, 75, 70, 75], [30, 75, 50, 90], [70, 75, 50, 90]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
          ))}
        </g>
      );
    case 20:
      return (
        <g className="sigil-flat-group">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 14;
            const a2 = ((i + 5) * Math.PI * 2) / 14;
            return <line key={i} x1={50 + Math.cos(a) * 45} y1={50 + Math.sin(a) * 45} x2={50 + Math.cos(a2) * 45} y2={50 + Math.sin(a2) * 45} stroke="currentColor" strokeWidth="0.8" />;
          })}
        </g>
      );
    case 21:
      return (
        <g className="sigil-flat-group">
          <circle cx="40" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="60" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M 50,27 A 25,25 0 0,0 50,73 A 25,25 0 0,0 50,27" fill="currentColor" className="opacity-50" />
        </g>
      );
    case 22:
      return (
        <g className="sigil-flat-group">
          <circle cx="50" cy="50" r="5" fill="currentColor" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 24;
            return <line key={i} x1={50 + Math.cos(a) * 10} y1={50 + Math.sin(a) * 10} x2={50 + Math.cos(a) * (i % 2 === 0 ? 45 : 25)} y2={50 + Math.sin(a) * (i % 2 === 0 ? 45 : 25)} stroke="currentColor" strokeWidth="1" />;
          })}
        </g>
      );
    case 23:
      return (
        <g className="sigil-3d-group">
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="50,25 70,35 70,65 50,75 30,65 30,35" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="1" />
          <line x1="90" y1="25" x2="70" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="90" y1="75" x2="70" y2="65" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="95" x2="50" y2="75" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="75" x2="30" y2="65" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="25" x2="30" y2="35" stroke="currentColor" strokeWidth="1" />
        </g>
      );
    case 24:
      return (
        <g className="sigil-flat-group">
          <path d="M 50,50 m 0,-45 a 45,45 0 1,1 -1,0" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 50,50 m 0,-35 a 35,35 0 1,1 -1,0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M 50,50 m 0,-25 a 25,25 0 1,1 -1,0" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 50,50 m 0,-15 a 15,15 0 1,1 -1,0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="5" fill="currentColor" />
        </g>
      );
    default:
      return (
        <g className="sigil-3d-group">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="85" y1="15" x2="65" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="15" y1="85" x2="35" y2="65" stroke="currentColor" strokeWidth="1" />
          <line x1="85" y1="85" x2="65" y2="65" stroke="currentColor" strokeWidth="1" />
        </g>
      );
  }
}

export default function HolographicSigil({ theoremId, onClick, dimmed, label }) {
  return (
    <div className="star-container sigil-container flex flex-col items-center justify-center mt-12 mb-4 cursor-pointer group" onClick={onClick}>
      <svg
        viewBox="0 0 100 100"
        className={`holographic-sigil-svg w-32 h-32 md:w-48 md:h-48 text-[var(--ink-red)] ${dimmed ? 'opacity-40' : 'opacity-100'}`}
      >
        {renderGeometry(theoremId)}
      </svg>
      <span className="font-medieval text-xs md:text-sm tracking-[0.3em] text-[var(--ink-red)] mt-6 uppercase group-hover:text-[var(--ink-gold)] transition-colors font-bold bg-[#050403]/80 px-4 py-2 rounded-md border border-[var(--ink-red)]/40 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.9)]">
        {label}
      </span>
    </div>
  );
}
