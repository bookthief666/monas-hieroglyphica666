# Monas Hieroglyphica — The Living Grimoire

An interactive, *operable* manifestation of John Dee's **Monas Hieroglyphica** (1564).
This is not a reading app; it is a vessel. The 24 theorems are arranged as an
initiatory ascent through the three phases of the alchemical Great Work, and the
operator is asked not merely to read Dee's geometry but to **operate** it.

> *"It is by the straight line and the circle that the first and most simple example
> and representation of all things may be demonstrated."* — Theorema I

## What it does

- **The 3D Monad scrying-orb** — a `react-three-fiber` Hieroglyphic Monad rebuilt as a
  spatial body (Sol torus, lunar crescent, elemental cross, Aries horns) suspended in a
  glass shew-stone. It tilts toward your cursor like a sympathetic magical link, and its
  bloom darkens, purifies, and blazes with the alchemical stage. Falls back gracefully to
  a 2D particle mirror on weak GPUs or when reduced-motion is set.
- **Scroll/gaze kinetic typography** — the text decrypts out of an aether-alphabet in
  proportion to your scroll and the proximity of your gaze. Truth is *pulled from the
  aether* by your own motion, not handed over on a timer.
- **The alchemical ascent** — the whole vessel shifts through **Nigredo → Albedo →
  Rubedo** as you progress through the theorems (light, colour, atmosphere, bloom).
- **Four registers of the Work** for every theorem:
  - **Verbum** — Dee's original theorem
  - **Exegesis** — a PhD-level reading
  - **Operatio** — the *Theurgic Application*: how a modern operator integrates the truth
    into cognitive framing, software architecture, and personal ritual
  - **Anatomia** — the **Operative Monad deconstructor**: drag the four members apart and
    recompose them; the mass is conserved at Dee's sacred 252, but *coherence* is what the
    operation transforms, crowning the Stone when fully synthesised
- **The Scholar's Margin** — comparative cross-references connecting Dee's geometry to the
  wider tapestry of esotericism (Kashmir Shaivism / Abhinavagupta, Plotinus, Lurianic
  Kabbalah, Advaita, Bataille's base materialism, and more), plus an interactive Lexicon.

## Tech

Vite + React 18 · Tailwind CSS · three.js / @react-three/fiber / drei / postprocessing.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/  (the WebGL stack is code-split & lazy-loaded)
npm run preview
```

## Structure

```
src/
  App.jsx                  orchestration + ritual/stage state
  data/theorems.js         the 24 theorems, fully expanded
  data/palettes.js         per-theorem colour palettes
  lib/stages.js            Nigredo/Albedo/Rubedo mapping
  lib/useScrollDecrypt.js  scroll+gaze → reveal ratio
  components/
    MonadOrb.jsx           flagship 3D Monad (react-three-fiber)
    KineticText.jsx        scroll/gaze-linked decrypting typography
    Deconstructor.jsx      operative Monad (drag-apart / recompose)
    ScholarMargin.jsx      cross-references + lexicon tooltips
    ApplicationPanel.jsx   Theurgic Application
    ParticleSigil.jsx      2D particle mirror (fallback + per-theorem sigil)
    HolographicSigil.jsx   per-theorem SVG glyph
    TheoremNav.jsx · AudioEngine.jsx · Threshold.jsx
```

*Let silence now seal the lips of the wise.* — Theorema XXIV
