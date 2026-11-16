import { expect, test } from "vite-plus/test";
import { readStoredTheme, resolveTheme, storeTheme } from "./theme";

const throwing = {
  getItem: () => {
    throw new Error("denied");
  },
  setItem: () => {
    throw new Error("denied");
  },
};

test("readStoredTheme returns null when storage throws", () => {
  expect(readStoredTheme(throwing)).toBeNull();
});

test("readStoredTheme returns null for unknown values", () => {
  expect(readStoredTheme({ getItem: () => "sepia" })).toBeNull();
});

test("readStoredTheme returns null without storage", () => {
  expect(readStoredTheme(undefined)).toBeNull();
});

test("readStoredTheme returns a valid stored theme", () => {
  expect(readStoredTheme({ getItem: () => "dark" })).toBe("dark");
});

test("stored theme wins over system preference", () => {
  expect(resolveTheme("light", true)).toBe("light");
});

test("falls back to system preference", () => {
  expect(resolveTheme(null, true)).toBe("dark");
  expect(resolveTheme(null, false)).toBe("light");
});

test("storeTheme swallows storage errors", () => {
  expect(() => storeTheme(throwing, "dark")).not.toThrow();
});
