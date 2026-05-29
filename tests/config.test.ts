import { describe, expect, it } from "vitest";
import { maskSecret, mergeWithDefaults, parseConfigValue } from "../src/config.js";

describe("config helpers", () => {
  it("masks api key safely", () => {
    expect(maskSecret("abcdefgh12345678")).toBe("abcd...5678");
    expect(maskSecret("short")).toBe("********");
  });

  it("parses number config values", () => {
    expect(parseConfigValue("maxDiffChars", "1234")).toBe(1234);
  });

  it("merges with defaults and validates", () => {
    const config = mergeWithDefaults({
      apiKey: "abc123",
      model: "gpt-4.1-mini",
      baseURL: "https://api.openai.com/v1",
    });
    expect(config.messageStyle).toBe("conventional-commits");
    expect(config.maxDiffChars).toBeGreaterThan(0);
  });
});
