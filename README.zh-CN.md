# comet

`comet` 是一个 CLI 工具，用 AI 根据 **已暂存（staged）** 的代码改动生成 Git 提交信息候选。

## 功能特性

- 纯命令行，无图形界面
- 默认只读取 staged diff（`git diff --cached`）
- 生成符合 Conventional Commits 风格的候选
- 支持 OpenAI 兼容接口（可自定义 `baseURL` 与 `model`）
- API Key 存储在用户本地配置文件
- 仅输出候选，由你手动执行 `git commit`

## 安装

推荐全局安装（普通用户）：

```bash
npm install -g comet
```

如果从本仓库源码安装：

```bash
npm install
npm run build
npm install -g .
```

安装后可在任意本地 Git 仓库直接使用：

```bash
comet
```

开发调试模式（不全局安装）：

```bash
npm run dev -- --help
```

## 配置

首次建议执行交互式初始化：

```bash
comet init
```

默认配置路径：

- macOS/Linux：`~/.config/comet/config.json`
- Windows：`%APPDATA%/comet/config.json`

配置项：

- `apiKey`
- `baseURL`（OpenAI 兼容接口地址）
- `model`
- `messageStyle`（`conventional-commits`）
- `locale`
- `maxDiffChars`

## 使用

根据 staged 改动生成候选：

```bash
comet generate
```

默认命令也会触发生成：

```bash
comet
```

机器可读输出：

```bash
comet generate --json --count 2
```

管理配置：

```bash
comet config get
comet config get apiKey
comet config set model gpt-4.1-mini
```

选择候选后手动提交：

```bash
git commit -m "feat(cli): add staged diff commit generator"
```
