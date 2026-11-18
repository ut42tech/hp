export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ut42tech:theme";

// Sets html[data-theme] before first paint: the stored choice, or else the OS, which it keeps following while
// nothing is stored. Runs inline in <head> from its own source text (components/SiteShell.vue), so it must not
// use any name outside itself; the tests check it reads what storeTheme writes.
export function themeGate(
  root: { dataset: DOMStringMap },
  storage: Pick<Storage, "getItem"> | undefined,
  media: { matches: boolean; addEventListener(type: "change", listener: () => void): void },
): void {
  const apply = () => {
    let stored: string | null = null;
    try {
      stored = storage?.getItem("ut42tech:theme") ?? null;
    } catch {
      // Blocked storage: follow the OS.
    }
    root.dataset.theme =
      stored === "light" || stored === "dark" ? stored : media.matches ? "dark" : "light";
  };
  apply();
  media.addEventListener("change", apply);
}

// Picking the theme the OS already shows means following the OS again, so nothing is kept for it. Storage access
// can throw (private mode, blocked site data); persisting is a convenience, so errors are swallowed.
export function storeTheme(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  theme: Theme,
  osTheme: Theme,
): void {
  try {
    if (theme === osTheme) storage?.removeItem(THEME_STORAGE_KEY);
    else storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The toggle keeps working for this page view.
  }
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
