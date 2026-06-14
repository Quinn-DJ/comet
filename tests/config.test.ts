import { describe, expect, it } from "vitest";
import {
  maskSecret,
  mergeWithDefaults,
  parseConfigKey,
  parseConfigValue,
} from "../src/config.js";

describe("config helpers", () => {
  it("masks api key safely", () => {
    expect(maskSecret("abcdefgh12345678")).toBe("abcd...5678");
    expect(maskSecret("short")).toBe("********");
  });

  it("masks exactly 8-char strings", () => {
    expect(maskSecret("12345678")).toBe("********");
  });

  it("returns empty for empty input", () => {
    expect(maskSecret("")).toBe("");
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

describe("parseConfigKey", () => {
  it("returns key for valid input", () => {
    expect(parseConfigKey("apiKey")).toBe("apiKey");
    expect(parseConfigKey("model")).toBe("model");
    expect(parseConfigKey("maxDiffChars")).toBe("maxDiffChars");
  });

  it("throws for unsupported key", () => {
    expect(() => parseConfigKey("nonexistent")).toThrow("Unsupported config key");
  });
});

describe("parseConfigValue", () => {
  it("rejects maxDiffChars of 0", () => {
    expect(() => parseConfigValue("maxDiffChars", "0")).toThrow("positive integer");
  });

  it("rejects negative maxDiffChars", () => {
    expect(() => parseConfigValue("maxDiffChars", "-5")).toThrow("positive integer");
  });

  it("rejects non-numeric maxDiffChars", () => {
    expect(() => parseConfigValue("maxDiffChars", "abc")).toThrow("positive integer");
  });

  it("accepts valid conventional-commits style", () => {
    expect(parseConfigValue("messageStyle", "conventional-commits")).toBe(
      "conventional-commits",
    );
  });

  it("rejects unsupported message style", () => {
    expect(() => parseConfigValue("messageStyle", "gitmoji")).toThrow(
      "conventional-commits",
    );
  });

  it("passes through string values for non-numeric keys", () => {
    expect(parseConfigValue("model", "gpt-4.1-mini")).toBe("gpt-4.1-mini");
  });
});
