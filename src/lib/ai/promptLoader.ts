import { promises as fs } from "node:fs";
import path from "node:path";

const PROMPT_FILE_NAME = "gpt5-nano-financial-educator.md";
const PROMPT_FILE_PATH = path.join(
  process.cwd(),
  "docs",
  "ai-prompts",
  PROMPT_FILE_NAME
);

let cachedPrompt: string | null = null;

function normalizePrompt(raw: string): string {
  return raw.replace(/\r\n/g, "\n").trim();
}

async function readPromptFromDisk(): Promise<string> {
  const fileContents = await fs.readFile(PROMPT_FILE_PATH, "utf8");
  return normalizePrompt(fileContents);
}

export interface LoadPromptOptions {
  forceRefresh?: boolean;
}

/**
 * Loads the GPT-5-nano financial educator prompt from disk and caches it to avoid repeated I/O.
 */
export async function loadFinancialEducatorPrompt(
  options: LoadPromptOptions = {}
): Promise<string> {
  const { forceRefresh = false } = options;

  if (!forceRefresh && cachedPrompt) {
    return cachedPrompt;
  }

  cachedPrompt = await readPromptFromDisk();
  return cachedPrompt;
}

export function invalidateFinancialEducatorPromptCache(): void {
  cachedPrompt = null;
}

export function getFinancialEducatorPromptPath(): string {
  return PROMPT_FILE_PATH;
}
