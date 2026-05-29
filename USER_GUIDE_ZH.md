# comet 使用手册（中文）

`comet` 是一个命令行工具，用来根据 **已暂存（staged）** 的 Git 改动生成提交信息候选。

## 1. 安装与环境要求

- Node.js 20+
- 推荐给普通用户的安装方式（全局安装，一次即可）：

```bash
npm install -g comet
```

如果你是从本仓库源码安装：

```bash
npm install
npm run build
npm install -g .
```

安装后，在任意本地 Git 仓库中都可直接使用：

```bash
comet
```

仅开发调试时才使用：

```bash
npm run dev -- --help
```

## 2. 配置 API

### 方式 A：交互式初始化（推荐）

```bash
comet init
```

会写入默认配置文件：

- macOS/Linux：`~/.config/comet/config.json`
- Windows：`%APPDATA%/comet/config.json`

### 方式 B：手动写配置文件

示例（DeepSeek）：

```json
{
  "apiKey": "你的API Key",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "messageStyle": "conventional-commits",
  "locale": "zh-CN",
  "maxDiffChars": 12000
}
```

如需使用自定义配置路径：

```bash
COMET_CONFIG_PATH=/path/to/config.json comet generate
```

## 3. 基本使用流程

1. 在你的 Git 仓库中修改代码。
2. 暂存改动（只会读取 staged diff）：

```bash
git add .
```

3. 生成提交信息候选：

```bash
comet generate --count 3
```

4. 或输出 JSON（便于脚本处理）：

```bash
comet generate --json --count 2
```

5. 选一条候选后手动提交：

```bash
git commit -m "feat: your message"
```

## 4. 常用命令

```bash
# 查看当前配置（默认隐藏 apiKey）
comet config get

# 查看某个配置项
comet config get model

# 设置配置项
comet config set model deepseek-chat

# 查看帮助
comet --help
```

## 5. 常见问题

### 报错：Config not found

先执行：

```bash
comet init
```

或确认 `COMET_CONFIG_PATH` 指向正确文件。

### 报错：No staged changes found

说明还没有暂存改动，先执行：

```bash
git add <文件名>
```

### 报错：Current directory is not inside a git repository

请在 Git 仓库目录内运行，或先初始化仓库：

```bash
git init
```

## 6. 开发者命令（本仓库）

```bash
# 测试
npm test

# 类型检查（lint）
npm run lint

# 构建
npm run build

# 单个测试文件
npx vitest run tests/config.test.ts

# 单个测试用例（按名称过滤）
npx vitest run tests/prompt.test.ts -t "includes locale and file list"
```
