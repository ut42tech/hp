import { parse } from "node-html-parser";
import { expect, test } from "vite-plus/test";
import { isOwnHandle } from "./handles";

// The app detail is a <dialog> inside the Works sheet; its handles must not also drag the sheet behind it.
const page = parse(`
  <section class="sheet" id="sheet">
    <div data-sheet-handle id="sheet-grabber"><span id="sheet-dot"></span></div>
    <p id="body">text</p>
    <dialog id="detail"><div data-sheet-handle id="detail-grabber"></div></dialog>
  </section>
`);
const el = (id: string) => page.getElementById(id) as unknown as Element;

test("the sheet's own grabber drags the sheet", () => {
  expect(isOwnHandle(el("sheet-dot"), el("sheet"))).toBe(true);
});

test("the content is not a handle", () => expect(isOwnHandle(el("body"), el("sheet"))).toBe(false));

test("a handle inside a dialog over the sheet belongs to the dialog", () => {
  expect(isOwnHandle(el("detail-grabber"), el("sheet"))).toBe(false);
  expect(isOwnHandle(el("detail-grabber"), el("detail"))).toBe(true);
});
