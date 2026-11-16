import { existsSync, readFileSync } from "node:fs";
import { profile } from "@ut42tech/profile";
import { beforeAll, describe, expect, test } from "vite-plus/test";

const indexHtml = new URL("../dist/index.html", import.meta.url);
let html = "";

describe("built index.html", () => {
  beforeAll(() => {
    if (!existsSync(indexHtml)) {
      throw new Error(
        "apps/web/dist/index.html is missing: run `vp run @ut42tech/web#build` first",
      );
    }
    html = readFileSync(indexHtml, "utf8");
  });

  test("is Japanese", () => expect(html).toContain('lang="ja"'));
  test("renders the profile without JavaScript", () => {
    expect(html).toContain(profile.name);
    expect(html).toContain(profile.motto);
    for (const link of profile.social) expect(html).toContain(`href="${link.href}"`);
  });
  test("sets the theme before first paint", () => expect(html).toContain("ut42tech:theme"));
  test("has a favicon", () => expect(html).toContain('<link rel="icon"'));
});
