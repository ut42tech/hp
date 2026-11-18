export type Theme = "light" | "dark";

// Keep the key and the resolution rules in sync with the inline script in components/SiteShell.vue.
export const THEME_STORAGE_KEY = "ut42tech:theme";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

// Storage access can throw (private mode, blocked site data), so every call is guarded.
export function readStoredTheme(storage: Pick<Storage, "getItem"> | undefined): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

// Picking the theme the OS already shows means following the OS again, so nothing is kept for it.
export function storeTheme(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  theme: Theme,
  osTheme: Theme,
): void {
  try {
    if (theme === osTheme) storage?.removeItem(THEME_STORAGE_KEY);
    else storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persisting is a convenience; the toggle keeps working for this page view.
  }
}

export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  return stored ?? (prefersDark ? "dark" : "light");
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
