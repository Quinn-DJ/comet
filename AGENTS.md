# Copilot instructions for `comet`

## Build, test, and lint

- Install deps: `npm install`
- Build CLI: `npm run build` (TypeScript compile to `dist/`)
- Type-check/lint: `npm run lint`
- Run all tests: `npm test`
- Run one test file: `npx vitest run tests/config.test.ts`
- Run one named test: `npx vitest run tests/prompt.test.ts -t "includes locale and file list"`
- Run CLI in dev (no build): `npm run dev -- --help`

## High-level architecture

`comet` is a Node.js ESM CLI that generates commit message candidates from **staged** git changes.

1. **CLI orchestration (`src/cli.ts`)**  
   Commander defines `init`, `config get/set`, and `generate` (also default command). `generate` loads config, checks git repo, reads staged diff + file list, calls AI generation, then prints numbered text or JSON.
2. **Config system (`src/config.ts`, `src/types.ts`)**  
   Zod is the source of truth for config shape and validation. Config file is user-scoped (`~/.config/comet/config.json` on Unix, `%APPDATA%/comet/config.json` on Windows), overridable via `COMET_CONFIG_PATH`. Writes enforce restrictive file permissions on non-Windows.
3. **Git input layer (`src/git.ts`)**  
   Uses `git diff --cached` only. Empty staged diff throws. Large diffs are truncated to `maxDiffChars` with a marker suffix to bound prompt size.
4. **Prompt + model output contract (`src/prompt.ts`, `src/ai.ts`)**  
   Prompt requires Conventional Commits output in strict JSON: `{ "candidates": [...] }`. Model output is parsed by extracting JSON and validating via Zod; candidate count is capped to 1-3 end-to-end.

## Key repository conventions

- **Staged changes only**: generation never reads unstaged/worktree diff.
- **Structured output contract**: AI responses are treated as machine data first (JSON + schema validation), not free-form text.
- **Conventional Commits is fixed**: `messageStyle` is effectively locked to `"conventional-commits"` (validated in config parsing and prompt rules).
- **Strong runtime validation**: config and model responses are validated with Zod at boundaries; invalid data should throw explicit errors.
- **ESM import style in TS**: local imports use `.js` extensions (e.g., `./config.js`) to match ESM build output.
- **Security-minded config handling**: secrets are masked in `config get` unless `--show-secrets`; config file permissions are tightened on Unix.
