# comet

`comet` is a CLI tool that uses AI to generate git commit message candidates from staged changes.

## Features

- CLI only, no GUI.
- Reads only staged diff by default (`git diff --cached`).
- Generates Conventional Commits style messages.
- Supports OpenAI-compatible APIs via custom `baseURL` + `model`.
- Stores API key in local config file (user scope).
- Prints candidates only; you run `git commit` manually.

## Install

```bash
npm install
npm run build
```

For local execution during development:

```bash
npm run dev -- --help
```

## Configuration

Run interactive setup:

```bash
npx tsx src/cli.ts init
```

Default config path:

- macOS/Linux: `~/.config/comet/config.json`
- Windows: `%APPDATA%/comet/config.json`

Config fields:

- `apiKey`
- `baseURL` (for OpenAI-compatible endpoint)
- `model`
- `messageStyle` (`conventional-commits`)
- `locale`
- `maxDiffChars`

## Usage

Generate commit message candidates from staged changes:

```bash
npx tsx src/cli.ts generate
```

Default command also triggers generate:

```bash
npx tsx src/cli.ts
```

Machine-readable output:

```bash
npx tsx src/cli.ts generate --json --count 2
```

Manage config:

```bash
npx tsx src/cli.ts config get
npx tsx src/cli.ts config get apiKey
npx tsx src/cli.ts config set model gpt-4.1-mini
```

After choosing one candidate:

```bash
git commit -m "feat(cli): add staged diff commit generator"
```
