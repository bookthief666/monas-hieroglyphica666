import React, { useState, useEffect, useRef, lazy, Suspense, Component } from 'react';
import { THEOREMS } from './data/theorems.js';
import { getPalette } from './data/palettes.js';
import { stageForTheorem } from './lib/stages.js';
import Threshold from './components/Threshold.jsx';
import { AudioEngine, MuteButton, RitualResonance } from './components/AudioEngine.jsx';
import ParticleSigil from './components/ParticleSigil.jsx';
import ExegesisSeal from './components/ExegesisSeal.jsx';
import { RitualApparition } from './components/RitualProjection.jsx';
import KineticText from './components/KineticText.jsx';
import ScholarMargin from './components/ScholarMargin.jsx';
import ApplicationPanel from './components/ApplicationPanel.jsx';
import Deconstructor from './components/Deconstructor.jsx';
import TheoremNav from './components/TheoremNav.jsx';

// The flagship 3D orb is code-split: the text-first experience never waits on WebGL.
const MonadOrb = lazy(() => import('./components/MonadOrb.jsx'));

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isMobile = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
};

const hasWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

class OrbBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.setState({ failed: true }); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function HeroSigil({ theorem, stage }) {
  const [allow3D, setAllow3D] = useState(() => hasWebGL() && !reducedMotion() && !isMobile());
  const [orbMounted, setOrbMounted] = useState(false);
  const containerRef = useRef(null);
  const fallback = <ParticleSigil currentShape={theorem.shape} theoremId={theorem.id} />;

  useEffect(() => {
    if (!allow3D || !orbMounted) return;
    const timer = setTimeout(() => {
      try {
        const canvas = containerRef.current?.querySelector('canvas');
        if (!canvas) { setAllow3D(false); return; }
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl || gl.isContextLost()) setAllow3D(false);
      } catch { setAllow3D(false); }
    }, 3000);
    return () => clearTimeout(timer);
  }, [allow3D, orbMounted]);

  if (!allow3D) return fallback;
  return (
    <div className="scrying-mirror" style={{ cursor: 'grab' }} ref={containerRef}>
      <OrbBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <MonadOrb theoremId={theorem.id} stage={stage} onReady={() => setOrbMounted(true)} />
        </Suspense>
      </OrbBoundary>
    </div>
  );
}

const VIEWS = [
  { id: 'theorem', label: 'Verbum' },
  { id: 'exegesis', label: 'Exegesis' },
  { id: 'application', label: 'Operatio' },
  { id: 'operate', label: 'Anatomia' },
];

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [active, setActive] = useState(1);
  const [item, setItem] = useState(THEOREMS[0]);
  const [transition, setTransition] = useState(false);
  const [viewMode, setViewMode] = useState('theorem');
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const stage = stageForTheorem(item.id);
  const palette = getPalette(item.id);

  useEffect(() => {
    document.title = `Monas Hieroglyphica — ${item.title}`;
  }, [item]);

  const startExperience = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((e) => console.error('Audio playback restricted by browser policy:', e));
    }
    setHasStarted(true);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const switchTheorem = (id) => {
    if (id === active || transition) return;
    setTransition(true);
    setTimeout(() => {
      setItem(THEOREMS.find((t) => t.id === id));
      setActive(id);
      setViewMode('theorem');
    }, 600);
    setTimeout(() => setTransition(false), 800);
  };

  const toggleExegesisViaSigil = () => {
    setViewMode((prev) => (prev === 'exegesis' ? 'theorem' : 'exegesis'));
  };

  return (
    <>
      <AudioEngine ref={audioRef} />
      <RitualResonance muted={isMuted || !hasStarted} />

      {!hasStarted ? (
        <Threshold onEnter={startExperience} />
      ) : (
        <div className={`stage-${stage.id} stage-veil-transition min-h-screen relative flex flex-col items-center justify-start py-6 md:py-12 px-2 md:px-8`}>
          <MuteButton muted={isMuted} onToggle={toggleAudio} />
          <RitualApparition theoremId={item.id} active={transition} />

          {/* Stage indicator — the operator's place on the alchemical ascent */}
          <div className="fixed top-4 left-4 z-50 text-left pointer-events-none">
            <span className="font-blackletter text-[var(--ink-gold)] text-lg glow-gold block leading-none">{stage.label}</span>
            <span className="font-medieval text-[var(--text-muted)] text-[0.6rem] tracking-[0.2em] uppercase opacity-70">{stage.latin}</span>
          </div>

          <div className="noise-overlay" />

          <div className="fixed inset-0 overflow-hidden z-0 bg-black">
            <div
              className="absolute inset-[-10%] bg-cover bg-center bg-animate transition-opacity duration-1000 ease-in-out mix-blend-screen"
              style={{
                backgroundImage: `url('${item.bgImage}')`,
                opacity: transition ? 0.3 : 1,
                filter: 'contrast(var(--stage-bg-contrast)) brightness(var(--stage-bg-brightness))',
              }}
            />
            <div className="shimmer-overlay" />
          </div>
          <div className="vignette" />

          <main className="parchment-panel w-full max-w-[1300px] min-h-[90vh] p-4 md:p-12 relative z-10 rounded-lg flex flex-col">
            <header className="text-center border-b border-[#3a2e1d]/60 pb-6 md:pb-8 mb-4 md:mb-6 relative">
              <h1 className="font-blackletter text-4xl sm:text-5xl md:text-7xl tracking-widest uppercase text-[#0a0a0a] drop-shadow-[0_0_15px_rgba(255,68,68,0.9)] mb-2 md:mb-4 leading-tight flex flex-wrap justify-center items-center gap-2 md:gap-4">
                <span>M<span className="text-[var(--ink-red)] drop-shadow-[0_0_10px_rgba(255,223,115,0.6)]">☉</span>NAS</span>
                <span>HIER<span className="text-[var(--ink-red)] drop-shadow-[0_0_10px_rgba(255,223,115,0.6)]">🜍</span>GLYPHI<span className="text-[var(--ink-red)] drop-shadow-[0_0_10px_rgba(255,223,115,0.6)]">☾</span>A</span>
              </h1>
              <p className="font-medieval text-[#0a0a0a] drop-shadow-[0_0_8px_rgba(255,223,115,1)] font-bold mt-2 md:mt-4 tracking-[0.2em] md:tracking-[0.4em] uppercase text-xs md:text-base opacity-90">
                I☉HANNES D<span className="text-[var(--ink-red)]">🜁🜁</span> <span className="text-[var(--ink-red)] mx-1 md:mx-2">❖</span> L☉NDINENSIS <span className="text-[var(--ink-red)] mx-1 md:mx-2">❖</span> 1564
              </p>
            </header>

            <div className="flex justify-center w-full my-6 md:my-10 relative z-20 animate-float animate-pulse-glow">
              <HeroSigil theorem={item} stage={stage.id} />
            </div>

            {/* View selector — the four registers of the Work */}
            <div className="flex justify-center gap-2 md:gap-4 mb-6 flex-wrap">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`font-medieval text-xs md:text-sm tracking-[0.2em] uppercase px-3 md:px-5 py-2 rounded border transition-all ${
                    viewMode === v.id
                      ? 'border-[var(--ink-gold)] text-[var(--ink-gold)] glow-gold bg-[var(--ink-gold)]/5'
                      : 'border-[var(--ink-red)]/30 text-[var(--text-muted)] hover:text-[var(--ink-gold)] hover:border-[var(--ink-gold)]/50 opacity-70'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className={`manuscript-grid mt-2 md:mt-4 transition-opacity duration-700 ${transition ? 'opacity-0 filter blur-md' : 'opacity-100 filter blur-0'} flex-grow`}>
              <aside className="hidden lg:block text-right pr-8 border-r border-[#3a2e1d]/40 pt-16 relative">
                <div className="sticky top-20">
                  <p className="font-script text-[var(--ink-gold)] text-2xl drop-shadow-[0_0_10px_rgba(255,223,115,0.6)] leading-relaxed transform -rotate-3 transition-all duration-1000">
                    {viewMode === 'exegesis' ? 'Revelatio Kabbalistica' : item.marginalia}
                  </p>
                </div>
              </aside>

              <article className="px-2 md:px-8 relative w-full flex flex-col items-center">
                <h2 className="font-blackletter text-3xl md:text-5xl glow-red mb-6 md:mb-10 text-center relative inline-block w-full">
                  {item.title}
                  <div className="absolute -bottom-2 md:-bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 md:w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[var(--ink-red)] to-transparent opacity-50" />
                </h2>

                {(viewMode === 'theorem' || viewMode === 'exegesis') && (
                  <div className="text-lg md:text-2xl leading-[1.7] md:leading-[1.8] text-justify drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] font-bold min-h-[150px] w-full">
                    <KineticText
                      text={viewMode === 'exegesis' ? item.exegesis : item.text}
                      variant={viewMode === 'exegesis' ? 'exegesis' : 'theorem'}
                      revealKey={`${item.id}-${viewMode}`}
                    />
                  </div>
                )}

                {viewMode === 'application' && <ApplicationPanel theorem={item} />}

                {viewMode === 'operate' && (
                  <Deconstructor theoremId={item.id} palette={palette} insight={item.operative?.insight} />
                )}

                {(viewMode === 'theorem' || viewMode === 'exegesis') && (
                  <ExegesisSeal
                    theoremId={item.id}
                    onClick={toggleExegesisViaSigil}
                    dimmed={viewMode === 'exegesis'}
                    label={viewMode === 'exegesis' ? 'Seal the Exegesis' : 'Unveil the Exegesis'}
                  />
                )}

                {/* Mobile scholar margin */}
                <div className="block lg:hidden mt-8 pt-8 border-t border-[#3a2e1d]/40 w-full">
                  <ScholarMargin theorem={item} heading="Scholar's Margin" />
                </div>
              </article>

              <aside className="hidden lg:block pl-8 border-l border-[#3a2e1d]/40 pt-16 relative">
                <div className="sticky top-20">
                  <ScholarMargin theorem={item} heading="Scholar's Margin" />
                </div>
              </aside>
            </div>

            <TheoremNav theorems={THEOREMS} active={active} onSelect={switchTheorem} />
          </main>
        </div>
      )}
    </>
  );
}
