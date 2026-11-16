import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

test("every export points to an existing file", () => {
  const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
  const targets = Object.values(pkg.exports as Record<string, string>);

  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) expect(existsSync(new URL(target, import.meta.url))).toBe(true);
});
