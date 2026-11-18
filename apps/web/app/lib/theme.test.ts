import { expect, test } from "vite-plus/test";
import { nextPreference, readPreference, resolveTheme, storePreference } from "./theme";

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

test("readPreference falls back to auto", () => {
  expect(readPreference(undefined)).toBe("auto");
  expect(readPreference({ getItem: () => "sepia" })).toBe("auto");
  expect(readPreference(throwing)).toBe("auto");
  expect(readPreference({ getItem: () => "dark" })).toBe("dark");
});

test("auto follows the OS", () => {
  expect(resolveTheme("auto", true)).toBe("dark");
  expect(resolveTheme("auto", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
});

test("nextPreference cycles auto → light → dark → auto", () => {
  expect((["auto", "light", "dark"] as const).map(nextPreference)).toEqual([
    "light",
    "dark",
    "auto",
  ]);
});

test("storing auto removes the key", () => {
  const calls: string[] = [];
  storePreference(
    { setItem: () => calls.push("set"), removeItem: () => calls.push("remove") },
    "auto",
  );
  expect(calls).toEqual(["remove"]);
});

test("storePreference swallows storage errors", () => {
  expect(() => storePreference(throwing, "dark")).not.toThrow();
  expect(() => storePreference(throwing, "auto")).not.toThrow();
});
