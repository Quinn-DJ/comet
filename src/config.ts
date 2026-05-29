import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { CONFIG_KEYS, type CometConfig, type ConfigKey } from "./types.js";

const configSchema = z.object({
  apiKey: z.string().min(1, "apiKey is required"),
  baseURL: z.url(),
  model: z.string().min(1),
  messageStyle: z.literal("conventional-commits"),
  locale: z.string().min(2),
  maxDiffChars: z.number().int().positive().max(200_000),
});

const partialConfigSchema = configSchema.partial();

export const DEFAULT_CONFIG: Omit<CometConfig, "apiKey"> = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
  messageStyle: "conventional-commits",
  locale: "en",
  maxDiffChars: 12000,
};

export function getConfigPath(): string {
  const override = process.env.COMET_CONFIG_PATH;
  if (override && override.trim()) return override;

  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    const baseDir = appData
      ? path.join(appData, "comet")
      : path.join(os.homedir(), "AppData", "Roaming", "comet");
    return path.join(baseDir, "config.json");
  }

  const xdgDir = process.env.XDG_CONFIG_HOME;
  const baseDir = xdgDir
    ? path.join(xdgDir, "comet")
    : path.join(os.homedir(), ".config", "comet");
  return path.join(baseDir, "config.json");
}

export async function readConfig(): Promise<CometConfig> {
  const file = getConfigPath();
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    throw new Error(
      `Config not found at ${file}. Run "comet init" to create it.`,
      { cause: error },
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Config file is not valid JSON: ${file}`, { cause: error });
  }
  return configSchema.parse(parsed);
}

export async function readConfigOrEmpty(): Promise<Partial<CometConfig>> {
  const file = getConfigPath();
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return partialConfigSchema.parse(parsed);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return {};
    }
    throw new Error(`Unable to read config at ${file}`, { cause: error });
  }
}

export async function writeConfig(config: CometConfig): Promise<string> {
  const file = getConfigPath();
  const validated = configSchema.parse(config);
  await mkdir(path.dirname(file), {
    recursive: true,
    mode: process.platform === "win32" ? undefined : 0o700,
  });
  await writeFile(file, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  if (process.platform !== "win32") {
    await chmod(file, 0o600);
  }
  return file;
}

export function parseConfigKey(input: string): ConfigKey {
  const hit = CONFIG_KEYS.find((key) => key === input);
  if (!hit) {
    throw new Error(
      `Unsupported config key "${input}". Allowed: ${CONFIG_KEYS.join(", ")}`,
    );
  }
  return hit;
}

export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function mergeWithDefaults(partial: Partial<CometConfig>): CometConfig {
  return configSchema.parse({
    ...DEFAULT_CONFIG,
    ...partial,
  });
}

export function parseConfigValue(key: ConfigKey, value: string): unknown {
  if (key === "maxDiffChars") {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error("maxDiffChars must be a positive integer");
    }
    return num;
  }
  if (key === "messageStyle" && value !== "conventional-commits") {
    throw new Error('messageStyle only supports "conventional-commits"');
  }
  return value;
}
