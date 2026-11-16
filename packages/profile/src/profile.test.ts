import { describe, expect, test } from "vite-plus/test";
import { profile } from "./index";

describe("profile", () => {
  test("identity", () => {
    expect(profile.name).toBe("Takuya Uehara");
    expect(profile.handle).toBe("ut42tech");
    expect(profile.motto).toBe("デザインとテクノロジーで、最高のユーザ体験を届けたい。");
    expect(profile.mottoEn).toBe("Delivering the best experiences with design & technology.");
  });

  test("social links are https and unique per icon", () => {
    expect(profile.social.length).toBe(7);
    for (const link of profile.social) expect(new URL(link.href).protocol).toBe("https:");
    expect(new Set(profile.social.map((l) => l.icon)).size).toBe(profile.social.length);
  });
});
