/// <reference types="node" />
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// The future Hono backend may run this package with plain Node (native type stripping), no bundler.
test("plain Node can import the package entry", () => {
  const entry = fileURLToPath(new URL("./index.ts", import.meta.url));
  const out = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const m = await import(${JSON.stringify(entry)}); console.log(m.profile.name);`,
    ],
    { encoding: "utf8" },
  );
  expect(out.trim()).toBe("Takuya Uehara");
});
