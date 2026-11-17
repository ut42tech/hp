import { expect, test } from "vite-plus/test";
import { applySheetMode, closeAction } from "./detail-sheet";

function fakeDialog() {
  const calls: string[] = [];
  return {
    calls,
    close: () => calls.push("close"),
    show: () => calls.push("show"),
    showModal: () => calls.push("showModal"),
  };
}

test("narrow screens show the detail as a modal sheet", () => {
  const dialog = fakeDialog();
  applySheetMode(dialog, true);
  expect(dialog.calls).toEqual(["close", "showModal"]);
});

test("wide screens put it back in the page flow (rotation or resize)", () => {
  const dialog = fakeDialog();
  applySheetMode(dialog, false);
  expect(dialog.calls).toEqual(["close", "show"]);
});

test("closing goes back when the detail was opened from the list", () => {
  const origin = "https://ut42tech.com";
  expect(closeAction(`${origin}/ja/works/apps`, "/ja/works/apps", origin)).toBe("back");
  expect(closeAction(`${origin}/ja/works/apps/`, "/ja/works/apps", origin)).toBe("back");
});

test("closing replaces the entry when the detail was opened from elsewhere", () => {
  const origin = "https://ut42tech.com";
  expect(closeAction("", "/ja/works/apps", origin)).toBe("replace");
  expect(closeAction(`${origin}/ja/about`, "/ja/works/apps", origin)).toBe("replace");
  expect(closeAction("https://example.com/ja/works/apps", "/ja/works/apps", origin)).toBe(
    "replace",
  );
});
