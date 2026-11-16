export type Theme = "light" | "dark";

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

export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  return stored ?? (prefersDark ? "dark" : "light");
}

export function storeTheme(storage: Pick<Storage, "setItem"> | undefined, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persisting is a convenience; the toggle keeps working for this page view.
  }
}
