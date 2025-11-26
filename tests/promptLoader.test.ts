import {
  invalidateFinancialEducatorPromptCache,
  loadFinancialEducatorPrompt,
} from "@/lib/ai/promptLoader";
import fs from "node:fs";

describe("loadFinancialEducatorPrompt", () => {
  beforeEach(() => {
    invalidateFinancialEducatorPromptCache();
    jest.restoreAllMocks();
  });

  it("loads the prompt content from disk and normalizes whitespace", async () => {
    const prompt = await loadFinancialEducatorPrompt({ forceRefresh: true });

    expect(prompt).toContain("You are a financial educator");
    expect(prompt).toContain("Answer ONLY in Korean.");
    expect(prompt.includes("\r")).toBe(false);
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("caches the prompt until explicitly refreshed", async () => {
    const spy = jest.spyOn(fs.promises, "readFile");

    await loadFinancialEducatorPrompt({ forceRefresh: true });
    expect(spy).toHaveBeenCalledTimes(1);

    await loadFinancialEducatorPrompt();
    expect(spy).toHaveBeenCalledTimes(1);

    await loadFinancialEducatorPrompt({ forceRefresh: true });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
