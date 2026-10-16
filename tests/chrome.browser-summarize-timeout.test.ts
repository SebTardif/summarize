import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchBrowserUrlContent: vi.fn(),
  loadSettings: vi.fn(),
}));

vi.mock("../apps/chrome-extension/src/lib/browser-url-content", () => ({
  fetchBrowserUrlContent: mocks.fetchBrowserUrlContent,
}));

vi.mock("../apps/chrome-extension/src/lib/settings", () => ({
  loadSettings: mocks.loadSettings,
  getProviderSettings: () => ({}),
}));

import { executeSummarizeTool } from "../apps/chrome-extension/src/automation/tools/summarize";

describe("browser summarize fetch deadline", () => {
  it("passes an abort signal to a direct browser fetch", async () => {
    mocks.loadSettings.mockResolvedValue({
      model: "browser/gemini-nano",
      length: "short",
      language: "en",
      promptOverride: "",
      maxOutputTokens: "",
      maxChars: 1000,
      token: "",
      summaryRuntime: "direct",
      provider: "openai",
      providerApiKeys: {},
    });
    mocks.fetchBrowserUrlContent.mockResolvedValue({
      text: "hello",
      url: "https://example.com/article",
      title: "Article",
      truncated: false,
    });

    await executeSummarizeTool({
      url: "https://example.com/article",
      extractOnly: true,
    });

    const options = mocks.fetchBrowserUrlContent.mock.calls[0]?.[0] as { signal?: AbortSignal };
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options.signal?.aborted).toBe(false);
  });
});
