import { readFileSync } from "node:fs";
import { describe, expect, test } from "vite-plus/test";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

function colorTokens(block: string): Set<string> {
  return new Set([...block.matchAll(/(--ut-color-[\w-]+)\s*:/g)].map((m) => m[1]!));
}

function blockAfter(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start + selector.length);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

describe("tokens.css", () => {
  test("dark mode defines every light color token", () => {
    const css = read("./tokens.css");
    const light = colorTokens(blockAfter(css, ":root {"));
    const systemDark = colorTokens(blockAfter(css, ':root:not([data-theme="light"])'));
    const forcedDark = colorTokens(blockAfter(css, ':root[data-theme="dark"]'));

    expect(light.size).toBeGreaterThan(0);
    expect(systemDark).toEqual(light);
    expect(forcedDark).toEqual(light);
  });
});

describe("theme.css", () => {
  test("dark: variant follows data-theme, not only the OS", () => {
    expect(read("./theme.css")).toContain(
      "@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));",
    );
  });

  test("theme.css maps every color token", () => {
    const light = colorTokens(blockAfter(read("./tokens.css"), ":root {"));
    const theme = blockAfter(read("./theme.css"), "@theme inline");

    for (const token of light) {
      const name = token.replace("--ut-", "--");
      expect(theme).toContain(`${name}: var(${token})`);
    }
  });
});
