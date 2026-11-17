import { expect, test } from "vite-plus/test";
import { closeAction, isPlainClick } from "./history";

test("closing goes back when the previous entry is where we are closing to", () => {
  expect(closeAction("/ja/works/apps", "/ja/works/apps")).toBe("back");
  expect(closeAction("/ja/works/apps/", "/ja/works/apps")).toBe("back");
  expect(closeAction("/ja/", "/ja/")).toBe("back");
});

test("closing replaces the entry when the detail or sheet was opened from elsewhere", () => {
  expect(closeAction("/ja/about", "/ja/works/apps")).toBe("replace");
  expect(closeAction(null, "/ja/")).toBe("replace");
  expect(closeAction(undefined, "/ja/works/apps")).toBe("replace");
});

test("only a plain left click is taken over; modified clicks keep the link's own behaviour", () => {
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  expect(isPlainClick(click)).toBe(true);
  expect(isPlainClick({ ...click, metaKey: true })).toBe(false);
  expect(isPlainClick({ ...click, ctrlKey: true })).toBe(false);
  expect(isPlainClick({ ...click, shiftKey: true })).toBe(false);
  expect(isPlainClick({ ...click, altKey: true })).toBe(false);
  expect(isPlainClick({ ...click, button: 1 })).toBe(false);
});
