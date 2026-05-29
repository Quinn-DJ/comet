export const CONFIG_KEYS = [
  "apiKey",
  "baseURL",
  "model",
  "messageStyle",
  "locale",
  "maxDiffChars",
] as const;

export type ConfigKey = (typeof CONFIG_KEYS)[number];

export type MessageStyle = "conventional-commits";

export interface CometConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  messageStyle: MessageStyle;
  locale: string;
  maxDiffChars: number;
}

export interface GenerateOptions {
  count: number;
}
