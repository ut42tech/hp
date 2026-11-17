import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

const motionDir = fileURLToPath(new URL("../app/motion", import.meta.url));

// Design §6: the motion layer is plain TypeScript, so another app (React or anything else) can reuse it.
test("app/motion stays free of Vue, Nuxt and motion-v", () => {
  const files = readdirSync(motionDir).filter((name) => name.endsWith(".ts"));
  expect(files.length).toBeGreaterThan(0);
  for (const name of files) {
    const source = readFileSync(join(motionDir, name), "utf8");
    expect(source, name).not.toMatch(
      /from ["'](vue|vue-router|nuxt[^"']*|#app|#imports|#components|motion-v)["']/,
    );
  }
});
