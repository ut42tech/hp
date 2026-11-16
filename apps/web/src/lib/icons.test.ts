import { h } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vite-plus/test";
import BrandIcon from "../components/BrandIcon.vue";
import UiIcon from "../components/UiIcon.vue";
import { brandIcons, uiIcons, type UiIconName } from "./icons";

test("every ui icon renders a Tabler outline at stroke 1.75", async () => {
  for (const name of Object.keys(uiIcons) as UiIconName[]) {
    const html = await renderToString(h(UiIcon, { name, size: 16 }));
    expect(html, name).toContain('width="16"');
    expect(html, name).toContain('stroke-width="1.75"');
    expect(html, name).toContain('aria-hidden="true"');
  }
});

test("every brand comes from a simple-icons package", () => {
  for (const [name, icon] of Object.entries(brandIcons))
    expect(icon.path.length, name).toBeGreaterThan(10);
  expect(brandIcons.linkedin.title).toBe("LinkedIn");
});

test("brand icons render as filled single-color shapes", async () => {
  const html = await renderToString(h(BrandIcon, { name: "github", size: 18 }));
  expect(html).toContain('fill="currentColor"');
  expect(html).toContain('width="18"');
  expect(html).toContain('aria-hidden="true"');
});
