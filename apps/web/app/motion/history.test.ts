import { expect, test } from "vite-plus/test";
import { closeAction } from "./history";

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
