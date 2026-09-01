const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function queryForces2D() {
  if (typeof window === 'undefined' || !window.location) return false;
  try {
    return new URLSearchParams(window.location.search).get('force2d') === '1';
  } catch {
    return false;
  }
}

// The glass/transmission orb is a desktop enhancement, never a requirement.
// Touch-first/foldable devices stay on the deterministic 2D shew-stone even if
// the browser requests a desktop viewport or reports a large CSS width.
export function shouldUse3DOrb({
  webglAvailable = false,
  width = 0,
  height = 0,
  touchFirst = false,
  coarsePointer = false,
  hoverNone = false,
  reducedMotion = false,
  saveData = false,
  constrained = false,
  maxTouchPoints = 0,
  userAgent = '',
  force2D = false,
} = {}) {
  // Explicit diagnostic/escape hatch. `?force2d=1` is intentionally honored
  // before every other capability signal so physical QA can prove that the
  // particle mirror path is running even if a browser exposes unusual device
  // metadata or a stale desktop-mode viewport.
  if (force2D || queryForces2D()) return false;
  if (!webglAvailable || reducedMotion || saveData || constrained) return false;

  const touchDevice = touchFirst
    || coarsePointer
    || hoverNone
    || Number(maxTouchPoints) > 0
    || MOBILE_UA.test(String(userAgent));

  if (touchDevice) return false;

  // The 3D orb is only worthwhile on a genuinely desktop-sized, fine-pointer
  // surface. Anything smaller receives the richer, interactive particle mirror.
  if (Number(width) < 1024 || Number(height) < 600) return false;

  return true;
}
