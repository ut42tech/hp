import { afterEach, describe, expect, it, vi } from "vitest";

import { getMicroCMSConfig } from "./config";

describe("getMicroCMSConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("env が揃っていれば設定を返す", () => {
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    expect(getMicroCMSConfig()).toEqual({
      serviceDomain: "example",
      apiKey: "test-key",
    });
  });

  it("未設定なら設定方法を含むメッセージで throw する", () => {
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "");
    vi.stubEnv("MICROCMS_API_KEY", "");
    expect(() => getMicroCMSConfig()).toThrow(/MICROCMS_SERVICE_DOMAIN/);
  });
});
