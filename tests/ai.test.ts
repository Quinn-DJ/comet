import { describe, expect, it } from "vitest";
import { extractJsonObject, parseCandidates } from "../src/ai.js";

describe("extractJsonObject", () => {
  it("extracts JSON wrapped in text", () => {
    const text = 'Here is the output: {"candidates":["feat: x"]}, done.';
    expect(extractJsonObject(text)).toBe('{"candidates":["feat: x"]}');
  });

  it("extracts pure JSON without wrapping text", () => {
    const text = '{"candidates":["feat: x","fix: y"]}';
    expect(extractJsonObject(text)).toBe(text);
  });

  it("extracts nested braces correctly (lastIndexOf wins)", () => {
    // Models sometimes include braces in commit message bodies
    const text = '{"candidates":["feat(api): add {id} param handling"]} extra';
    expect(extractJsonObject(text)).toBe(
      '{"candidates":["feat(api): add {id} param handling"]}',
    );
  });

  it("throws when no opening brace exists", () => {
    expect(() => extractJsonObject("no braces here")).toThrow(
      "does not contain a JSON object",
    );
  });

  it("throws when no closing brace exists", () => {
    expect(() => extractJsonObject('{"candidates":["x"]')).toThrow(
      "does not contain a JSON object",
    );
  });

  it("throws when braces are reversed (closing before opening)", () => {
    expect(() => extractJsonObject('}"candidates":["x"]{')).toThrow(
      "does not contain a JSON object",
    );
  });
});

describe("parseCandidates", () => {
  it("parses a single candidate", () => {
    const result = parseCandidates('{"candidates":["feat: add login"]}');
    expect(result).toEqual(["feat: add login"]);
  });

  it("parses three candidates", () => {
    const result = parseCandidates(
      '{"candidates":["feat: x","fix: y","docs: z"]}',
    );
    expect(result).toEqual(["feat: x", "fix: y", "docs: z"]);
  });

  it("ignores extra JSON fields", () => {
    const result = parseCandidates(
      '{"candidates":["feat: x"],"extra":42,"other":true}',
    );
    expect(result).toEqual(["feat: x"]);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseCandidates("{not valid json}")).toThrow(
      "Model returned invalid JSON",
    );
  });

  it("throws when candidates array is empty", () => {
    expect(() => parseCandidates('{"candidates":[]}')).toThrow();
  });

  it("throws when a candidate is an empty string", () => {
    expect(() => parseCandidates('{"candidates":[""]}')).toThrow();
  });

  it("throws when candidates exceed 3", () => {
    expect(() =>
      parseCandidates('{"candidates":["a","b","c","d"]}'),
    ).toThrow();
  });
});
