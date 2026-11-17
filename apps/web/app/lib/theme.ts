export type Theme = "light" | "dark";
export type ThemePreference = "auto" | "light" | "dark";

// Keep the key and the resolution rules in sync with the inline script in layouts/Site.astro.
export const THEME_STORAGE_KEY = "ut42tech:theme";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

// Storage access can throw (private mode, blocked site data), so every call is guarded.
export function readPreference(storage: Pick<Storage, "getItem"> | undefined): ThemePreference {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : "auto";
  } catch {
    return "auto";
  }
}

export function storePreference(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  pref: ThemePreference,
): void {
  try {
    if (pref === "auto") storage?.removeItem(THEME_STORAGE_KEY);
    else storage?.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Persisting is a convenience; the toggle keeps working for this page view.
  }
}

export function resolveTheme(pref: ThemePreference, prefersDark: boolean): Theme {
  if (pref !== "auto") return pref;
  return prefersDark ? "dark" : "light";
}

const order: readonly ThemePreference[] = ["auto", "light", "dark"];

export function nextPreference(pref: ThemePreference): ThemePreference {
  return order[(order.indexOf(pref) + 1) % order.length]!;
}
