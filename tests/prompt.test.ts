import { describe, expect, it } from "vitest";
import { buildCommitPrompt } from "../src/prompt.js";

describe("buildCommitPrompt", () => {
  it("includes locale and file list", () => {
    const text = buildCommitPrompt({
      diff: "diff --git a/a b/a",
      files: ["src/cli.ts", "src/config.ts"],
      locale: "zh-CN",
      count: 2,
    });
    expect(text).toContain("Language locale: zh-CN");
    expect(text).toContain("src/cli.ts");
    expect(text).toContain("exactly 2 candidates");
  });
});
