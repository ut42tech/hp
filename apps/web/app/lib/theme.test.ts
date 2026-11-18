import { expect, test } from "vite-plus/test";
import { otherTheme, storeTheme, themeGate } from "./theme";

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

function fakeMedia(matches: boolean) {
  const listeners: (() => void)[] = [];
  return {
    matches,
    addEventListener: (_: "change", listener: () => void) => listeners.push(listener),
    change(next: boolean) {
      this.matches = next;
      for (const listener of listeners) listener();
    },
  };
}

const storageWith = (value: string | null) => ({ getItem: () => value });

test("themeGate follows the OS when nothing usable is stored", () => {
  for (const storage of [undefined, storageWith(null), storageWith("sepia"), throwing]) {
    const root = { dataset: {} as DOMStringMap };
    themeGate(root, storage, fakeMedia(true));
    expect(root.dataset.theme).toBe("dark");
  }
});

test("themeGate prefers the stored theme over the OS", () => {
  const root = { dataset: {} as DOMStringMap };
  themeGate(root, storageWith("light"), fakeMedia(true));
  expect(root.dataset.theme).toBe("light");
});

test("themeGate keeps following the OS as it changes", () => {
  const root = { dataset: {} as DOMStringMap };
  const media = fakeMedia(false);
  themeGate(root, storageWith(null), media);
  media.change(true);
  expect(root.dataset.theme).toBe("dark");
});

// The gate runs from its own source text, so it spells the key out; it must be the one storeTheme writes.
test("themeGate reads what storeTheme writes", () => {
  const data: Record<string, string> = {};
  const storage = {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => (data[key] = value),
    removeItem: (key: string) => delete data[key],
  };
  storeTheme(storage, "dark", "light");
  const root = { dataset: {} as DOMStringMap };
  themeGate(root, storage, fakeMedia(false));
  expect(root.dataset.theme).toBe("dark");
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
