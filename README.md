# Monas Hieroglyphica — The Living Grimoire

An interactive, *operable* manifestation of John Dee's **Monas Hieroglyphica** (1564).
This is not a reading app; it is a vessel. The 24 theorems are arranged as an
initiatory ascent through the three phases of the alchemical Great Work, and the
operator is asked not merely to read Dee's geometry but to **operate** it.

> *"It is by the straight line and the circle that the first and most simple example
> and representation of all things may be demonstrated."* — Theorema I

## What it does

- **The Living Black Mirror** — each of the 24 theorems has a canonical particle body and
  theorem-specific physical law: trace it, hold it into operative charge, turn or disturb
  it, release it, and let the stone remember the working. Desktop may elevate the vessel
  into a lazy-loaded `react-three-fiber` Monad orb; touch-first devices use the operable
  2D shew-stone.
- **Scroll/gaze kinetic typography** — the text decrypts out of an aether-alphabet in
  proportion to scroll and proximity. Truth is *pulled from the aether* by the operator's
  motion rather than handed over as a static page.
- **The alchemical ascent** — the whole vessel shifts through **Nigredo → Albedo →
  Rubedo** as the 24 theorems unfold: light, colour, atmosphere, manifestation and
  resonance change with the stage.
- **Four registers of the Work** for every theorem:
  - **Verbum** — an English project reading of the theorem, now paired with a normalized
    Latin incipit and explicit **1564 Antwerp source witness**. The source layer links to
    the Library of Congress facsimile and distinguishes primary witness, transcription,
    translation reference and project text.
  - **Exegesis** — an advanced interpretive reading whose reveal can remember prior work.
  - **Operatio** — the *Theurgic Application*: cognitive, architectural and personal ritual
    consequences, plus the residual operative body left by the shew-stone.
  - **Anatomia** — the **Operative Monad deconstructor**: drag the four members apart and
    recompose them; mass remains at Dee's sacred 252 while coherence transforms and the
    Stone is crowned when synthesis is restored.
- **The Reliquary of Figures** — secondary echo and operative geometries live outside the
  canonical mirror. In Verbum they now visibly condense from a drifting manuscript field
  into an animated engraved plate. Deliberately displaced legacy forms from Theorems V,
  IX and XX are preserved as explicit *reliquiae* rather than silently discarded.
- **Continuity of the Work** — prior mirror operations affect return-state, Exegesis,
  Operatio, Anatomia, the theorem ladder, Scholar's Margin, the Threshold and the faint
  under-glass body of a revisited theorem. The registers transform through one another
  rather than behaving as unrelated tabs.
- **The Scholar's Margin** — comparative cross-references connect Dee's geometry to wider
  esoteric and philosophical traditions, with an interactive Lexicon. A prior operation
  may foreground a resonant existing concordance without rewriting the scholarship.

## Source witness

The historical anchor is John Dee, *Monas Hieroglyphica*, Antwerp: G. Silvius,
1564 (Library of Congress LCCN 11023473). Latin displayed in the app is labeled as
a **normalized incipit**, not a diplomatic transcription. The 1564 facsimile remains the
authority for original spelling, typography, capitalization, diagrams and spacing.
English text in Verbum is identified as project text; J. W. Hamilton-Jones (1947) and
C. H. Josten (1964) are exposed as translation references rather than silently collapsed
into the primary source.

## Tech

Vite + React 18 · Tailwind CSS · three.js / @react-three/fiber / drei / postprocessing.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # geometry + source/continuity + performance contract + production build
npm run build      # → dist/  (the WebGL stack is code-split & lazy-loaded)
npm run preview
```

## Structure

```
src/
  App.jsx                       orchestration + ritual/stage state
  data/theorems.js              the 24 theorem readings and interpretive payload
  data/palettes.js              per-theorem colour palettes
  lib/manifestationSpec.js      theorem field/physics/operative semantics
  lib/mirrorGeometry.js         canonical shew-stone geometry
  lib/projectionSpec.js         echo/operative projection reliquary
  lib/sourceWitness.js          1564 witness + normalized Latin incipits
  lib/ritualContinuity.js       cross-register memory semantics
  lib/useScrollDecrypt.js       scroll/gaze → reveal ratio
  components/
    ParticleSigil.jsx           operable 2D Living Black Mirror
    MonadOrb.jsx                optional desktop 3D Monad
    ReliquaryIllumination.jsx   smoke/geometry → engraved secondary plate
    SourceWitness.jsx           Textus / 1564 witness surface
    MirrorReturnImprint.jsx     remembered under-glass residual body
    RegisterMetamorphosis.jsx   geometry transition between registers
    KineticText.jsx             scroll/gaze-linked decrypting typography
    Deconstructor.jsx           Anatomia: drag-apart / recompose
    ScholarMargin.jsx           concordances + lexicon
    ApplicationPanel.jsx        Operatio / Theurgic Application
    TheoremNav.jsx · AudioEngine.jsx · Threshold.jsx
```

*Let silence now seal the lips of the wise.* — Theorema XXIV
