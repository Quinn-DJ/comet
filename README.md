# comet

`comet` is a CLI tool that uses AI to generate git commit message candidates from staged changes.

中文文档：[`README.zh-CN.md`](./README.zh-CN.md)

## Features

- CLI only, no GUI.
- Reads only staged diff by default (`git diff --cached`).
- Generates Conventional Commits style messages.
- Supports OpenAI-compatible APIs via custom `baseURL` + `model`.
- Stores API key in local config file (user scope).
- Prints candidates only; you run `git commit` manually.

## Install

Global install (recommended for end users):

```bash
npm install -g comet
```

If you are developing from source in this repository:

```bash
npm install
npm run build
npm install -g .
```

After global install, run directly in any local git repository:

```bash
comet
```

For local execution during development (without global install):

```bash
npm run dev -- --help
```

## Configuration

Run interactive setup once:

```bash
comet init
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
comet generate
```

Default command also triggers generate:

```bash
comet
```

Machine-readable output:

```bash
comet generate --json --count 2
```

Manage config:

```bash
comet config get
comet config get apiKey
comet config set model gpt-4.1-mini
```

After choosing one candidate:

```bash
git commit -m "feat(cli): add staged diff commit generator"
```
