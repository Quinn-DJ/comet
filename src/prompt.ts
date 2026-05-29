export function buildCommitPrompt(input: {
  diff: string;
  files: string[];
  locale: string;
  count: number;
}): string {
  const { diff, files, locale, count } = input;
  return [
    "Generate git commit messages from the provided staged diff.",
    "Constraints:",
    "1. Use Conventional Commits format: <type>(optional-scope): <subject>.",
    "2. Subject must be imperative and concise (max 72 chars preferred).",
    "3. Do not mention ticket IDs unless clearly present in diff context.",
    `4. Language locale: ${locale}.`,
    `5. Return exactly ${count} candidates.`,
    "6. Output JSON only using this schema:",
    '{ "candidates": ["feat: ...", "fix: ..."] }',
    "",
    `Changed files:\n${files.join("\n") || "(unknown)"}`,
    "",
    "Staged diff:",
    diff,
  ].join("\n");
}
