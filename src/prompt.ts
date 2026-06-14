/**
 * Build the user prompt for the commit message generation LLM call.
 *
 * Key design decisions:
 * - Valid types are enumerated to prevent non-standard types (e.g. "add", "update").
 * - Scope is guided by file paths rather than left to the model's imagination.
 * - Imperative mood is reinforced with a counter-example.
 * - A compact few-shot example anchors the output format.
 * - The diff is placed last so its size doesn't harm attention on earlier constraints.
 * - No negative instruction like "do not mention X" — use positive framing instead.
 */
export function buildCommitPrompt(input: {
  diff: string;
  files: string[];
  locale: string;
  count: number;
}): string {
  const { diff, files, locale, count } = input;

  const fileList =
    files.length > 0 ? files.map((f) => `  - ${f}`).join("\n") : "  - (unknown)";

  // Keep the example diff realistic but short; the contract is the shape.
  return [
    "Generate git commit messages from the staged diff below.",

    "## Type",
    "Choose the most specific type that fits the change:",
    "  feat     – new feature or functionality",
    "  fix      – bug fix",
    "  docs     – documentation only",
    "  style    – formatting, whitespace, semicolons (no logic change)",
    "  refactor – code restructuring without behavior change",
    "  perf     – performance improvement",
    "  test     – adding or updating tests",
    "  chore    – maintenance, tooling, dependency bumps",
    "  ci       – CI/CD pipeline changes",
    "  build    – build system or external dependencies",

    "## Scope",
    "Infer the scope from the changed file paths below. If the change spans multiple",
    "unrelated areas, omit the scope. Examples:",
    '  "src/api/users.ts"       → users',
    '  "src/cli.ts"             → cli',
    '  "docs/", "README.md"     → docs',
    '  "src/foo.ts", "tests/"   → omit scope (too broad)',

    "## Subject",
    "- MUST be imperative mood: \"add token refresh\" not \"added token refresh\"",
    "- Concise, ideally ≤ 72 characters",
    "- Lowercase after the colon, no trailing period",

    "## Body",
    "Include a body (blank line after subject then multi-line explanation) only when",
    "the diff is complex enough that the subject alone would be ambiguous.",
    "",
    "Example with body:",
    '  feat(auth): add silent token refresh',
    "",
    "  Refresh access tokens in the background when still valid.",
    "  Uses a 5-minute buffer before the actual expiry to avoid",
    "  unnecessary redirects to login.",

    "## Locale",
    `Write messages in ${locale}.`,

    "## Output",
    `Return exactly ${count} candidates as a JSON object. No markdown fences, no extra text.`,

    "Example output for a diff that adds a token refresh helper:",
    '{ "candidates": ["feat(auth): add token refresh helper", "refactor(auth): extract token refresh into dedicated module"] }',

    "",
    "Changed files:",
    fileList,
    "",
    "Staged diff:",
    diff,
  ].join("\n");
}
