# Living Grimoire — Release Audit Ledger

This ledger begins after creative feature work was frozen. From this point forward,
changes should correspond to a reproducible release finding, not speculative scope.

## Audited baseline

- Vision-complete checkpoint: `checkpoint/living-grimoire-ix-vision-complete-6c82a0c`
- Release-candidate start: `checkpoint/release-candidate-start-b05443b`
- First strict green audit checkpoint: `checkpoint/release-audit-green-b397f82`
- Audit branch: `agent/release-candidate-polish`

The strict release gate is:

```bash
npm run release:check
```

It executes the canonical mirror/source/continuity verifier, performance contract,
release-polish verifier, production release audit, production Vite build, and a
production-dependency security audit.

## A — Release mechanics

**Status: PASS after fixes**

Fixed during audit:

- Verification CI now runs on the release-candidate branch, `main`, and pull
  requests into `main`.
- The obsolete development branch is no longer allowed to auto-deploy.
- GitHub Pages auto-deploys only from `main`.
- The Pages build job executes `npm run release:check` before artifact upload.
- Deployment depends on the verified build job.
- Vite retains `base: './'` so a Pages/sub-path deployment resolves generated
  assets correctly.

Manual repository-policy item:

- `main` is currently unprotected. Before merge, enable a branch protection rule
  or ruleset requiring the `verify` check and preferably a pull request before
  changes land on `main`. The app's deploy workflow will refuse to publish an
  unverified build, but repository protection is still the correct history-level
  guard.

## B — Production/runtime surface

**Status: PASS automated gate**

Verified:

- 24/24 canonical theorems are present.
- 24 theorem backgrounds are unique and use immutable 40-character Git commit
  URLs rather than mutable raw-GitHub branch URLs.
- Every raw-GitHub runtime asset found under `src/` is required to be commit-pinned.
- The ambient audio URL is explicit and immutable.
- The production document has language, viewport, description, and favicon data.
- Source-witness links use HTTPS; external new-tab links use `noreferrer`.
- Ritual memory reads/writes are guarded against unavailable/corrupt localStorage.
- Google Fonts remain an optional network dependency; serif/cursive fallbacks are
  present, so font failure should degrade typography rather than break the app.

Manual distribution item:

- Confirm public-distribution permission for the ambient audio recording before
  a public 1.0 release. This audit does not make a rights determination.

## C — Dependency / supply-chain security

**Status: PASS**

CI runs:

```bash
npm audit --omit=dev --audit-level=high
```

as part of `npm run release:check`. The first audited RC completed this strict gate
successfully.

## D — Interaction and accessibility

**Status: PARTIAL — two documented findings**

Improved during release polish:

- Theorem rail announces `I—XXIV`.
- Mobile/Fold rail exposes a swipe hint, visible continuation fades, left/right
  controls, scroll snapping, and a discoverable scrollbar cue.
- Active theorem auto-centers.
- Theorem numerals have 44×44 minimum touch targets.
- Numeral buttons expose destination labels and `aria-current="page"`.
- Reduced-motion behavior remains respected by new release-polish animation.

Remaining findings:

1. **A11Y-P2 — Living Black Mirror keyboard parity**
   The canonical 2D mirror is operated by pointer/touch trace, hold, rotation and
   release gestures. Its current DOM surface is not keyboard-operable.

2. **A11Y-P2 — Anatomia keyboard parity**
   The four Monad members are pointer-draggable SVG groups. `Solve` and `Coagula`
   are buttons, but moving individual members has no keyboard equivalent.

These do not block the primary touch-first physical target, but they prevent a
claim of full keyboard parity. Resolve before 1.0 if keyboard accessibility is a
release requirement; otherwise document them as known limitations rather than
pretending compliance.

## E — Visual / physical QA

**Status: PENDING OWNER ACCEPTANCE**

Required on the physical target before release:

- Confirm the compact `Reliquiae Figurarum` plate is proportionate and legible.
- Confirm `Recast` still produces a complete dust → echo → operative etching.
- Confirm theorem rail initially communicates that later theorems exist.
- Swipe the rail to XXIV; use both arrow controls; confirm edge cues reverse at
  each end and selecting a numeral recenters it.
- Verify there is no page-level horizontal overflow outside the theorem rail.
- Exercise Black Mirror trace, hold, turn/drag, release and revisit memory.
- Cross Verbum → Exegesis → Operatio → Anatomia and back.
- Test V, IX and XX recovered reliquiae.
- Test XIII, XIX, XXIII and XXIV high-complexity projection plates.
- Rotate/open/close the Fold and repeat a theorem switch after each geometry change.
- Confirm audio initiation/mute and re-entry memory.
- Confirm rapid theorem switching and rapid document scrolling do not restore the
  compositor jitter/washout defects.

## F — Source/content audit

**Status: IN PROGRESS**

Already enforced:

- 24 normalized Latin incipits exist.
- The UI labels them as normalized witnesses, not diplomatic transcriptions.
- Project English, primary witness, and translation references are distinguished.
- 1564 facsimile and catalogue links are exposed.

Still required:

- Spot-check Latin incipits against the 1564 witness across Nigredo, Albedo and
  Rubedo, then sample the highest-risk/longest entries.
- Confirm theorem numbering/title alignment and source links from the built UI.
- Review interpretive claims that sound like direct Dee attribution and ensure
  primary-source vs interpretive synthesis remains clear.

## G — Production smoke test

**Status: PENDING MERGE**

Do not perform until the release candidate is approved for `main`.

After merge and Pages deployment:

- open the actual Pages URL in a clean/private browser session;
- verify first-load assets and fonts;
- enter the Work with no prior localStorage;
- verify one theorem from each alchemical stage;
- verify the 2D touch path and, separately, desktop 3D fallback/elevation;
- verify source links and audio behavior;
- reload and confirm ritual memory survives;
- test with network throttling/offline-after-load to characterize external-asset
  degradation;
- record the deployed commit SHA as the 1.0 release candidate.

## Release decision rule

Release only when all P0/P1 findings are closed, the strict release gate is green
on the exact candidate SHA, physical Fold QA is accepted, public audio-distribution
permission is confirmed, and the production Pages smoke test passes. P2 findings
must either be fixed or explicitly accepted/documented.
