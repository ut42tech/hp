import { expect, test } from "vite-plus/test";
import { applyTheme, otherTheme, readStoredTheme, resolveTheme, storeTheme } from "./theme";

const throwing = {
  getItem: () => {
    throw new Error("denied");
  },
  setItem: () => {
    throw new Error("denied");
  },
  removeItem: () => {
    throw new Error("denied");
  },
};

test("readStoredTheme returns a stored light or dark, otherwise nothing", () => {
  expect(readStoredTheme(undefined)).toBeNull();
  expect(readStoredTheme({ getItem: () => "sepia" })).toBeNull();
  expect(readStoredTheme({ getItem: () => "auto" })).toBeNull();
  expect(readStoredTheme(throwing)).toBeNull();
  expect(readStoredTheme({ getItem: () => "dark" })).toBe("dark");
});

test("without a stored theme the page follows the OS", () => {
  expect(resolveTheme(null, true)).toBe("dark");
  expect(resolveTheme(null, false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
});

test("the toggle has two states", () => {
  expect(otherTheme("light")).toBe("dark");
  expect(otherTheme("dark")).toBe("light");
});

// Choosing what the OS already shows is the same as following it, so the page keeps following the OS.
test("storing the OS's own theme removes the key; the other one is kept", () => {
  const calls: string[] = [];
  const storage = {
    setItem: (_: string, value: string) => calls.push(`set ${value}`),
    removeItem: () => calls.push("remove"),
  };
  storeTheme(storage, "dark", "dark");
  storeTheme(storage, "light", "dark");
  expect(calls).toEqual(["remove", "set light"]);
});

test("storeTheme swallows storage errors", () => {
  expect(() => storeTheme(throwing, "dark", "light")).not.toThrow();
  expect(() => storeTheme(throwing, "dark", "dark")).not.toThrow();
});

// The tokens read [data-theme]; the animated toggle (@theme-toggles/vue) reads a `.dark` class on the root.
test("applyTheme sets data-theme and the dark class together", () => {
  const classes = new Set<string>();
  const root = {
    dataset: {} as DOMStringMap,
    classList: {
      toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)),
    },
  };
  applyTheme(root, "dark");
  expect([root.dataset.theme, classes.has("dark")]).toEqual(["dark", true]);
  applyTheme(root, "light");
  expect([root.dataset.theme, classes.has("dark")]).toEqual(["light", false]);
});
