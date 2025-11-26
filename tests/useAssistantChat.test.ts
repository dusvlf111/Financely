import { useAssistantChat } from "@/hooks/useAssistantChat";
import { act, renderHook } from "@testing-library/react";

describe("useAssistantChat", () => {
  const originalCrypto = global.crypto;
  const originalFetch = global.fetch;

  beforeAll(() => {
    global.crypto = {
      randomUUID: () => "mock-id",
    } as Crypto;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterAll(() => {
    global.crypto = originalCrypto;
    global.fetch = originalFetch;
  });

  it("responds inside the conversation when user is not logged in", async () => {
    const { result } = renderHook(() => useAssistantChat());

    await act(async () => {
      const success = await result.current.sendMessage("게스트 테스트");
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "게스트 테스트",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "로그인 후 이용 가능합니다.",
    });
  });

  it("stores response id and reuses it on the next request", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { reply: "첫 번째 답변", responseId: "resp_1" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { reply: "두 번째 답변", responseId: "resp_2" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useAssistantChat({ userId: "user-1" }));

    await act(async () => {
      const success = await result.current.sendMessage("첫 질문");
      expect(success).toBe(true);
    });

    const firstBody = fetchMock.mock.calls[0]?.[1]?.body as string;
    expect(firstBody).toContain('"message":"첫 질문"');
    expect(firstBody).not.toContain("previousResponseId");

    await act(async () => {
      const success = await result.current.sendMessage("두 번째 질문");
      expect(success).toBe(true);
    });

    const secondBody = fetchMock.mock.calls[1]?.[1]?.body as string;
    expect(secondBody).toContain('"previousResponseId":"resp_1"');
  });

  it("renders assistant error message when API request fails", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "서버 오류" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useAssistantChat({ userId: "user-1" }));

    await act(async () => {
      const success = await result.current.sendMessage("API 실패");
      expect(success).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "서버 오류",
    });
    expect(result.current.error).toBeNull();
  });
});
