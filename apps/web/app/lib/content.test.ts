import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";
import { entryId } from "./localized";

const contentDir = fileURLToPath(new URL("../../content", import.meta.url));

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith(".md") ? [path] : [];
  });
}

function thumbnailOf(file: string): string | undefined {
  const block = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  return block.match(/^thumbnail:\s*"?([^"\n]+)"?$/m)?.[1];
}

test("entryId drops the collection and keeps <lang>/<slug>", () => {
  expect(entryId("apps/ja/coto2-ba")).toBe("ja/coto2-ba");
});

test("every thumbnail in content points to a file in public/works", () => {
  for (const file of markdownFiles(contentDir)) {
    const thumbnail = thumbnailOf(file);
    if (!thumbnail) continue;
    expect(thumbnail, file).toMatch(/^\/works\//);
    expect(existsSync(new URL(`../../public${thumbnail}`, import.meta.url)), file).toBe(true);
  }
});
