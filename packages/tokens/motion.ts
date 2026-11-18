// Motion values from docs/superpowers/specs/2026-11-18-portfolio-motion-design.md §8 (tuned in the prototype).

// Stiffness from the visual spec §9.4. Damping 39 is critical (2·√380): no overshoot, so a sheet does not
// wobble as it lands. Progress runs 0–1, so the rest thresholds are scaled to it: Motion's defaults
// (0.01 and 0.1/s) stop about 8px short on a phone and snap the rest.
export const SHEET_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 39,
  restDelta: 0.0005,
  restSpeed: 0.005,
} as const;

// Inertia per millisecond, used to predict where a flick would come to rest.
export const DECAY_PER_MS = 0.998;
// A sheet closes when the drag plus the predicted travel passes this share of its height.
export const CLOSE_FRACTION = 1 / 3;
// Above fully open, a sheet moves this much per pixel pulled.
export const RUBBER_BAND = 0.15;
// While switching tabs, the page is swapped once the sheet is this close to stowed.
export const SWAP_AT = 0.03;
// "Reduce motion": springs become a short fade.
export const REDUCED_DURATION_MS = 150;

// The Works sheet behind an app detail: narrower on each side and its top edge lifted.
export const RECEDE = { insetPx: 12, liftPx: 10 } as const;

// Swapping content in place (desktop, Works categories): old content out, new content in from below.
export const SWAP_OUT_MS = 120;
export const SWAP_IN_MS = 200;
export const SWAP_IN_OFFSET_PX = 8;

// The mark under the selected tab or category slides to a new item. Small and close, so it is stiffer
// than a sheet; damping a touch above critical (2·√500 ≈ 44.7) keeps it from overshooting.
export const SELECTION_SPRING = { type: "spring", stiffness: 500, damping: 45 } as const;

// Items moving to their new place when a list is re-sorted (same feel as a sheet: no overshoot).
export const REORDER_SPRING = { type: "spring", stiffness: 380, damping: 39 } as const;

// The entrance (visual spec §9.1): times are ms from the start, all ending by removeAt.
export const INTRO = {
  nameIn: { at: 80, duration: 600 },
  nameOut: { at: 780, duration: 500, opacityDuration: 350, liftPx: 24 },
  bands: { count: 5, at: 780, staggerMs: 60, duration: 820 },
  letters: { at: 1060, staggerMs: 45, duration: 900, fromEm: 0.35 },
  sub: { at: 1660, duration: 600 },
  removeAt: 1930,
  fontWaitMs: 1500,
  reducedFadeMs: 400,
  // Longer than the slowest real start (fontWaitMs + removeAt + start-up), so it never cuts an intro short.
  failsafeMs: 5000,
} as const;

// The --ut-ease-* curves as numbers, for animations started from script.
export const EASE = {
  "ease-out": [0.2, 0.8, 0.2, 1],
  "ease-rise": [0.2, 1, 0.3, 1],
  "ease-curtain": [0.76, 0, 0.24, 1],
  "ease-in-out": [0.7, 0, 0.3, 1],
} as const;

// The Hello greeting (visual spec §9.2): letters lean toward a nearby pointer and bounce when pressed.
export const GREETING = {
  reachPx: 420,
  maxX: 14,
  maxY: 10,
  spring: { type: "spring", stiffness: 160, damping: 20 },
  idleMs: 2500,
  bounce: { minSpeed: 260, maxSpeed: 320 },
} as const;

// Switching between light and dark: the new theme grows from the toggle as a circle with a soft edge
// (`feather` is the share of its radius that fades out).
export const THEME_SWITCH = { durationMs: 800, feather: 0.25, ease: "ease-out" } as const;
