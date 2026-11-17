import { expect, test } from "vite-plus/test";
import { applySheetMode } from "./dialog-mode";

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
