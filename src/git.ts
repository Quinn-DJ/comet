import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    throw new Error(`Failed to run git ${args.join(" ")}`, { cause: error });
  }
}

export async function ensureGitRepository(): Promise<void> {
  // Check git binary is available
  try {
    await execFileAsync("git", ["--version"]);
  } catch {
    throw new Error(
      "Git is not installed or not in PATH. Please install git first.",
    );
  }

  const inside = (await runGit(["rev-parse", "--is-inside-work-tree"])).trim();
  if (inside !== "true") {
    throw new Error("Current directory is not inside a git repository.");
  }
}

export async function getStagedDiff(maxChars: number): Promise<string> {
  const diff = await runGit(["diff", "--cached", "--no-color", "--unified=3"]);
  const trimmed = diff.trim();
  if (!trimmed) {
    throw new Error("No staged changes found. Stage files first with git add.");
  }
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n\n[diff truncated by comet for token limit]`;
}

export async function getStagedFileList(): Promise<string[]> {
  const output = await runGit(["diff", "--cached", "--name-only"]);
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
