import OpenAI from "openai";
import { z } from "zod";
import { buildCommitPrompt } from "./prompt.js";
import type { CometConfig } from "./types.js";

const responseSchema = z.object({
  candidates: z
    .array(z.string().min(1))
    .min(1)
    .max(3),
});

export function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response does not contain a JSON object.");
  }
  return text.slice(start, end + 1);
}

export function parseCandidates(content: string): string[] {
  const rawJson = extractJsonObject(content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new Error("Model returned invalid JSON.", { cause: error });
  }
  const result = responseSchema.parse(parsed);
  return result.candidates;
}

export async function generateCommitCandidates(input: {
  config: CometConfig;
  diff: string;
  files: string[];
  count: number;
}): Promise<string[]> {
  const { config, diff, files, count } = input;
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: 60_000,
  });

  const prompt = buildCommitPrompt({
    diff,
    files,
    locale: config.locale,
    count,
  });

  const completion = await client.chat.completions.create({
    model: config.model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          "You are a commit message generator that produces Conventional Commits output.",
          "You analyze staged code diffs, classify changes into standard types,",
          "infer scope from file paths, and write concise imperative summaries.",
          "You always output valid JSON matching the requested schema with no extra text.",
          "You never invent scopes that don't appear in the changed files.",
        ].join(" "),
      },
      { role: "user", content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Model returned empty content.");
  }
  const candidates = parseCandidates(content);
  return candidates.slice(0, count);
}
