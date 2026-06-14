#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { generateCommitCandidates } from "./ai.js";
import {
  DEFAULT_CONFIG,
  getConfigPath,
  maskSecret,
  mergeWithDefaults,
  parseConfigKey,
  parseConfigValue,
  readConfig,
  readConfigOrEmpty,
  writeConfig,
} from "./config.js";
import { ensureGitRepository, getStagedDiff, getStagedFileList } from "./git.js";
import type { CometConfig } from "./types.js";

function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function printCandidates(candidates: string[]): void {
  for (let i = 0; i < candidates.length; i += 1) {
    console.log(`${i + 1}. ${candidates[i]}`);
  }
}

async function promptForConfig(): Promise<CometConfig> {
  const existing = await readConfigOrEmpty();
  const rl = createInterface({ input: stdin, output: stdout });
  const ask = async (question: string, fallback?: string): Promise<string> => {
    const suffix = fallback ? ` [${fallback}]` : "";
    const value = (await rl.question(`${question}${suffix}: `)).trim();
    return value || fallback || "";
  };

  try {
    const apiKey = await ask("API key", existing.apiKey);
    const baseURL = await ask("Base URL", existing.baseURL ?? DEFAULT_CONFIG.baseURL);
    const model = await ask("Model", existing.model ?? DEFAULT_CONFIG.model);
    const locale = await ask("Locale", existing.locale ?? DEFAULT_CONFIG.locale);
    const maxDiffCharsRaw = await ask(
      "Max diff chars",
      String(existing.maxDiffChars ?? DEFAULT_CONFIG.maxDiffChars),
    );
    const maxDiffChars = Number(maxDiffCharsRaw);
    if (!Number.isInteger(maxDiffChars) || maxDiffChars <= 0) {
      throw new Error("Max diff chars must be a positive integer.");
    }
    return mergeWithDefaults({
      ...existing,
      apiKey,
      baseURL,
      model,
      locale,
      maxDiffChars,
      messageStyle: "conventional-commits",
    });
  } finally {
    rl.close();
  }
}

async function handleGenerate(options: { json?: boolean; count?: string }): Promise<void> {
  const config = await readConfig();
  await ensureGitRepository();
  const count = options.count ? Number(options.count) : 3;
  if (!Number.isInteger(count) || count <= 0 || count > 3) {
    throw new Error("count must be an integer between 1 and 3.");
  }
  const diff = await getStagedDiff(config.maxDiffChars);
  const files = await getStagedFileList();
  process.stderr.write("Generating commit message candidates...\n");
  const candidates = await generateCommitCandidates({
    config,
    diff,
    files,
    count,
  });
  if (candidates.length < count) {
    console.error(
      `Warning: only ${candidates.length} candidate(s) generated (requested ${count}).`,
    );
  }
  if (options.json) {
    printJson({ candidates });
    return;
  }
  printCandidates(candidates);
}

const program = new Command();
program
  .name("comet")
  .description("Generate AI git commit message candidates from staged changes.")
  .version("0.1.0");

program
  .command("init")
  .description("Create or update local comet config.")
  .action(async () => {
    const config = await promptForConfig();
    const file = await writeConfig(config);
    console.log(`Config saved to ${file}`);
  });

const configCommand = program
  .command("config")
  .description("Read or modify comet configuration.");

configCommand
  .command("get")
  .argument("[key]", "config key")
  .option("--show-secrets", "show full secret values")
  .option("--json", "print JSON output")
  .action(async (key: string | undefined, options: { showSecrets?: boolean; json?: boolean }) => {
    const config = await readConfig();
    if (options.json) {
      const output = {
        ...config,
        apiKey: options.showSecrets ? config.apiKey : maskSecret(config.apiKey),
      };
      printJson(output);
      return;
    }
    if (!key) {
      for (const k of ["apiKey", "baseURL", "model", "messageStyle", "locale", "maxDiffChars"] as const) {
        const value = k === "apiKey" && !options.showSecrets
          ? maskSecret(config[k])
          : String(config[k]);
        console.log(`${k} = ${value}`);
      }
      return;
    }
    const configKey = parseConfigKey(key);
    const rawValue = config[configKey];
    if (configKey === "apiKey" && !options.showSecrets) {
      console.log(maskSecret(String(rawValue)));
      return;
    }
    console.log(String(rawValue));
  });

configCommand
  .command("set")
  .argument("<key>", "config key")
  .argument("<value>", "config value")
  .action(async (key: string, value: string) => {
    const configKey = parseConfigKey(key);
    const current = await readConfig();
    const next = mergeWithDefaults({
      ...current,
      [configKey]: parseConfigValue(configKey, value),
    });
    const file = await writeConfig(next);
    console.log(`Updated ${configKey} in ${file}`);
  });

program
  .command("generate")
  .description("Generate commit messages from staged changes.")
  .option("--json", "print JSON output")
  .option("--count <number>", "number of candidates (1-3)")
  .action(handleGenerate);

program
  .argument("[defaultCommand]", "if omitted, runs generate")
  .option("--json", "print JSON output for default generate")
  .option("--count <number>", "number of candidates (1-3) for default generate")
  .action(async (defaultCommand: string | undefined, options: { json?: boolean; count?: string }) => {
    if (defaultCommand && defaultCommand !== "generate") {
      throw new Error(`Unknown command: ${defaultCommand}`);
    }
    await handleGenerate(options);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
