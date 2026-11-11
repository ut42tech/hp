import { describe, expect, it } from "vitest";

import { getPrimarySocial } from "./social";
import type { SocialLink } from "./types";

describe("getPrimarySocial", () => {
  it("primary: true だけを定義順で返す", () => {
    const links: SocialLink[] = [
      { label: "A", href: "a", icon: "x", primary: true },
      { label: "B", href: "b", icon: "note" },
      { label: "C", href: "c", icon: "github", primary: true },
    ];
    expect(getPrimarySocial(links).map((l) => l.label)).toEqual(["A", "C"]);
  });

  it("実データは X / GitHub / Zenn / Wantedly の順", () => {
    expect(getPrimarySocial().map((l) => l.label)).toEqual([
      "X",
      "GitHub",
      "Zenn",
      "Wantedly",
    ]);
  });
});
