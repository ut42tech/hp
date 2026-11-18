import { expect, test } from "vite-plus/test";
import { INTRO_STORAGE_KEY, introGate } from "./intro-gate";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => void (data[key] = value),
  };
}

const throwing = {
  getItem: () => {
    throw new Error("denied");
  },
  setItem: () => {
    throw new Error("denied");
  },
};

test("the first load in a tab plays and remembers it", () => {
  const storage = fakeStorage();
  expect(introGate(storage, false)).toBe("play");
  expect(storage.data[INTRO_STORAGE_KEY]).toBeDefined();
});

test("later loads in the same tab show nothing", () => {
  expect(introGate(fakeStorage({ [INTRO_STORAGE_KEY]: "1" }), false)).toBe("none");
});

test("reduced motion only fades the curtain", () => {
  expect(introGate(fakeStorage(), true)).toBe("fade");
});

test("blocked storage shows nothing rather than risk replaying", () => {
  expect(introGate(throwing, false)).toBe("none");
  expect(introGate(undefined, false)).toBe("none");
});

test("the gate is self-contained, so it can be inlined", () => {
  // Runs from its own source text, with no access to this module's scope.
  const inlined = new Function(`return (${introGate.toString()})`)() as typeof introGate;
  expect(inlined(fakeStorage(), false)).toBe("play");
});
