import { describe, expect, it } from "vitest";
import { buildCommitPrompt } from "../src/prompt.js";

describe("buildCommitPrompt", () => {
  it("includes locale, file list, count, types, and output format", () => {
    const text = buildCommitPrompt({
      diff: "diff --git a/a b/a",
      files: ["src/cli.ts", "src/config.ts"],
      locale: "zh-CN",
      count: 2,
    });

    // Locale
    expect(text).toContain("Write messages in zh-CN");

    // File list
    expect(text).toContain("src/cli.ts");
    expect(text).toContain("src/config.ts");

    // Count requirement
    expect(text).toContain("exactly 2 candidates");

    // Valid type enumeration
    expect(text).toContain("feat     – new feature");
    expect(text).toContain("fix      – bug fix");

    // Imperative mood rule
    expect(text).toContain("imperative mood");

    // Scope guidance
    expect(text).toContain("Infer the scope from the changed file paths");

    // Output contract
    expect(text).toContain('"candidates"');

    // Example is present
    expect(text).toContain("Example output");

    // Diff at the end (recency-bias protection)
    const diffIndex = text.lastIndexOf("Staged diff:");
    const localeIndex = text.indexOf("Write messages in zh-CN");
    expect(diffIndex).toBeGreaterThan(localeIndex);
  });
});
