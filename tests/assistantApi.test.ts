import { POST } from "@/app/api/ai/assistant/route";
import * as promptLoader from "@/lib/ai/promptLoader";
import { resetRateLimiter } from "@/lib/ai/rateLimiter";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const userHeaders = new Headers({ "x-user-id": "user-123" });

const createRequest = (body?: unknown, headers: HeadersInit = userHeaders) => {
  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("content-type", "application/json");

  return new Request("http://localhost/api/ai/assistant", {
    method: "POST",
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe("POST /api/ai/assistant", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetRateLimiter();
    process.env.GPT5_NANO_API_KEY = "test-key";
    jest
      .spyOn(promptLoader, "loadFinancialEducatorPrompt")
      .mockResolvedValue("system prompt");
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            id: "resp_mock",
            output: [
              {
                type: "message",
                role: "assistant",
                content: [
                  {
                    type: "output_text",
                    text: "안녕하세요. 금융 질문에 답변드리겠습니다.",
                  },
                ],
              },
            ],
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        )
      )
    );
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it("rejects requests without authentication headers", async () => {
    const response = await POST(
      createRequest({ message: "테스트" }, new Headers())
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("validates message presence and length", async () => {
    const missingBody = await POST(createRequest(undefined));
    expect(missingBody.status).toBe(400);

    const emptyMessage = await POST(createRequest({ message: "   " }));
    expect(emptyMessage.status).toBe(400);

    const longMessage = "a".repeat(401);
    const tooLong = await POST(createRequest({ message: longMessage }));
    expect(tooLong.status).toBe(400);
  });

  it("returns rate limited response after 10 requests in one hour", async () => {
    for (let i = 0; i < 10; i += 1) {
      const res = await POST(createRequest({ message: `질문 ${i}` }));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(createRequest({ message: "추가 질문" }));
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("relays the assistant reply when OpenAI responds successfully", async () => {
    const response = await POST(
      createRequest({ message: "ETF가 무엇인가요?" })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.reply).toContain("금융 질문");
    expect(body.data.responseId).toBeTruthy();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    );

    const requestInit = (global.fetch as jest.Mock).mock.calls[0]?.[1] as
      | RequestInit
      | undefined;
    const requestBody = requestInit?.body as string | undefined;
    expect(requestBody).toContain('"input"');
    expect(requestBody).toContain('"instructions":"system prompt"');
  });

  it("passes previous_response_id when provided", async () => {
    const response = await POST(
      createRequest({
        message: "두 번째 질문",
        previousResponseId: "resp_1",
      })
    );

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"previous_response_id":"resp_1"'),
      })
    );
  });

  it("rejects invalid previousResponseId payloads", async () => {
    const badType = await POST(
      createRequest({
        message: "테스트",
        previousResponseId: 123 as unknown as string,
      })
    );
    expect(badType.status).toBe(400);

    const emptyString = await POST(
      createRequest({ message: "테스트", previousResponseId: "   " })
    );
    expect(emptyString.status).toBe(400);
  });
});
