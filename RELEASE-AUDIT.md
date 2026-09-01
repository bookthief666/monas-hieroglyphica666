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

Release-blocking rights item:

- Confirm public-distribution permission for the ambient audio recording before
  a public 1.0 release. The code points to a commercial recording; this audit does
  not assume redistribution rights merely because the file is technically
  reachable. If rights cannot be confirmed, remove/replace that recording while
  retaining the procedural Ritual Resonance layer.

## C — Dependency / supply-chain security

**Status: PASS**

CI runs:

```bash
npm audit --omit=dev --audit-level=high
```

as part of `npm run release:check`. The audited RC completed this strict gate
successfully.

## D — Interaction and accessibility

**Status: PASS FOR 1.0 TARGET / P2 LIMITATIONS DOCUMENTED**

Improved during release polish:

- Theorem rail announces `I—XXIV`.
- Mobile/Fold rail exposes a swipe hint, visible continuation fades, left/right
  controls, scroll snapping, and a discoverable scrollbar cue.
- Active theorem auto-centers.
- Theorem numerals have 44×44 minimum touch targets.
- Numeral buttons expose destination labels and `aria-current="page"`.
- Reduced-motion behavior remains respected by new release-polish animation.

Accepted post-1.0 accessibility work:

1. **A11Y-P2 — Living Black Mirror keyboard parity**
   The canonical 2D mirror is operated by pointer/touch trace, hold, rotation and
   release gestures. Its current DOM surface is not keyboard-operable.

2. **A11Y-P2 — Anatomia keyboard parity**
   The four Monad members are pointer-draggable SVG groups. `Solve` and `Coagula`
   are buttons, but moving individual members has no keyboard equivalent.

These are explicitly documented limitations rather than claims of full keyboard
parity. They are not treated as blockers for the touch-first 1.0 target because a
late alternate input model would materially expand regression scope.

## E — Visual / physical QA

**Status: OWNER-ACCEPTED ON PRIMARY FOLD PATH**

Physically exercised during the final polish sequence:

- compact `Reliquiae Figurarum` hierarchy;
- recovered figures and Recast behavior;
- discoverable theorem rail, horizontal continuation and numeral selection;
- Black Mirror interaction and theorem/register traversal;
- rapid theorem switching/scrolling after the compositor stabilization work.

Final production smoke testing remains required after deployment. DuckDuckGo on
Android previously exhibited intermittent compositor flashing while the same
build rendered correctly in another browser; Chrome/Samsung Internet are the
canonical Fold release-QA path unless a later audit proves DuckDuckGo parity.

## F — Source/content audit

**Status: PASS FOR RELEASE SCOPE**

Enforced and reviewed:

- 24 normalized Latin incipits exist.
- The UI labels them as normalized witnesses, not diplomatic transcriptions.
- Project English, primary witness, and translation references are distinguished.
- 1564 facsimile and catalogue links are exposed.
- Verbum now labels the English body **`English reading · project text` at the
  point of reading**, before the prose can be mistaken for a direct Dee
  translation.
- Exegesis labels itself **`Interpretive exegesis · project commentary`** at the
  point of reading.
- The source panel remains visibly titled **`Textus · 1564 Witness`**.
- Theorem numbering/IDs are already locked 1–24 by the canonical verifier.
- Latin incipits were manually spot-checked against the 1564 witness across the
  alchemical sequence: I and VIII (Nigredo boundary), XVI (Albedo boundary), and
  XXIV (Rubedo culmination). Those audited phrases are now pinned in the release
  verifier so accidental source drift fails CI.

This is a release source-provenance audit, not a claim that every long interpretive
paragraph has received a new critical-edition peer review. Interpretive synthesis
remains explicitly labeled as project commentary.

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
permission is confirmed (or the commercial recording is removed/replaced), and the
production Pages smoke test passes. Accepted P2 limitations must remain documented.
