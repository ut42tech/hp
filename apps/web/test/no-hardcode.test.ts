import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

const src = fileURLToPath(new URL("../src", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(astro|vue|ts)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

function violations(files: string[], pattern: RegExp): string[] {
  return files.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, i) =>
        pattern.test(line) ? [`${relative(src, file)}:${i + 1}: ${line.trim()}`] : [],
      ),
  );
}

const files = sourceFiles(src);
// BrandIcon.vue draws simple-icons path data in an <svg>; the shape itself is bound, never written.
const shapeFiles = files.filter((f) => !f.endsWith("BrandIcon.vue"));
const uiFiles = files.filter((f) => /[/\\](components|views|layouts)[/\\]/.test(f));

test("no SVG shapes are written in source", () => {
  expect(violations(shapeFiles, /<svg|<path|<circle|\sd="M/)).toEqual([]);
  expect(violations(files, /\sd="M/)).toEqual([]);
});

test("UI strings come from the dictionaries, not components", () => {
  expect(violations(uiFiles, /[぀-ヿ㐀-鿿]/)).toEqual([]);
});

test("colors come from the tokens", () => {
  expect(violations(files, /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)).toEqual([]);
});
