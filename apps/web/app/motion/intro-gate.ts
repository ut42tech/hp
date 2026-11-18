export type IntroMode = "play" | "fade" | "none";

export const INTRO_STORAGE_KEY = "ut42tech:intro";

// Whether this load shows the entrance: once per tab (sessionStorage), only a fade with reduced motion, and
// nothing when storage is blocked (better than replaying on every load). Runs inline in <head> before first
// paint from its own source text (components/SiteShell.vue), so it must not use any name outside itself.
export function introGate(
  storage: Pick<Storage, "getItem" | "setItem"> | undefined,
  reduced: boolean,
): IntroMode {
  const key = "ut42tech:intro";
  try {
    if (!storage || storage.getItem(key)) return "none";
    storage.setItem(key, "1");
  } catch {
    return "none";
  }
  return reduced ? "fade" : "play";
}
