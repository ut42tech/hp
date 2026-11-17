import { existsSync, readdirSync, readFileSync } from "node:fs";
import { parse, type HTMLElement } from "node-html-parser";

const dist = new URL("../.output/public/", import.meta.url);

export function readDist(path: string): string {
  const file = new URL(path, dist);
  if (!existsSync(file)) {
    throw new Error(
      `apps/web/.output/public/${path} is missing: run \`pnpm --filter @ut42tech/web build\` first`,
    );
  }
  return readFileSync(file, "utf8");
}

// "/ja/about" → dist/ja/about/index.html
export function loadPage(route: string): HTMLElement {
  const path = `${route.replace(/^\//, "").replace(/\/?$/, "/")}index.html`.replace(/^\//, "");
  return parse(readDist(path === "/index.html" ? "index.html" : path));
}

export function appRoutes(locale: string): string[] {
  return readdirSync(new URL("../content/apps/ja/", import.meta.url))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `/${locale}/works/apps/${f.replace(/\.md$/, "")}`);
}

// Reads `key: value` pairs from a Markdown file's front matter (enough for the checks in these tests).
export function readFrontmatter(path: string): Record<string, string> {
  const text = readFileSync(new URL(`../content/${path}`, import.meta.url), "utf8");
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  return Object.fromEntries(
    block
      .split("\n")
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1]!, m[2]!.replace(/^"(.*)"$/, "$1")]),
  );
}
