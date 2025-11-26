import AssistantWidget from "@/components/modals/AssistantWidget";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

jest.mock("@/lib/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/useAssistantChat", () => ({
  useAssistantChat: jest.fn(),
  MAX_MESSAGE_LENGTH: 400,
}));

const { useAuth } = jest.requireMock("@/lib/context/AuthProvider") as {
  useAuth: jest.Mock;
};

const { useAssistantChat } = jest.requireMock("@/hooks/useAssistantChat") as {
  useAssistantChat: jest.Mock;
};

describe("AssistantWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAssistantChat.mockReturnValue({
      messages: [
        {
          id: "init",
          role: "assistant",
          content: "안녕하세요",
          createdAt: Date.now(),
        },
      ],
      isSending: false,
      error: null,
      sendMessage: jest.fn().mockResolvedValue(true),
      resetConversation: jest.fn(),
      clearConversation: jest.fn(),
    });
  });

  it("renders toggle button and opens the widget", () => {
    useAuth.mockReturnValue({ user: { id: "user-1" }, isGuest: false });
    render(<AssistantWidget />);

    const toggleButton = screen.getByRole("button", {
      name: /ai 질문하기/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByText("AI 금융 어시스턴트")).toBeInTheDocument();
  });

  it("surfaces login guidance when user is not authenticated", async () => {
    const sendMessageMock = jest.fn().mockResolvedValue(false);
    useAssistantChat.mockReturnValue({
      messages: [],
      isSending: false,
      error: null,
      sendMessage: sendMessageMock,
      resetConversation: jest.fn(),
      clearConversation: jest.fn(),
    });
    useAuth.mockReturnValue({ user: null, isGuest: false });

    const { rerender } = render(<AssistantWidget />);
    fireEvent.click(screen.getByRole("button", { name: /ai 질문하기/i }));

    const textarea = screen.getByPlaceholderText(/궁금한 내용을 물어보세요/i);
    fireEvent.change(textarea, { target: { value: "로그인 테스트" } });
    fireEvent.click(screen.getByRole("button", { name: "전송" }));

    expect(sendMessageMock).toHaveBeenCalledWith("로그인 테스트");

    useAssistantChat.mockReturnValue({
      messages: [
        {
          id: "guest-notice",
          role: "assistant",
          content: "로그인 후 이용 가능합니다.",
          createdAt: Date.now(),
        },
      ],
      isSending: false,
      error: null,
      sendMessage: sendMessageMock,
      resetConversation: jest.fn(),
      clearConversation: jest.fn(),
    });

    await act(async () => {
      rerender(<AssistantWidget />);
    });

    expect(screen.getByText("로그인 후 이용 가능합니다.")).toBeInTheDocument();
  });

  it("submits the message when authenticated", async () => {
    const sendMessageMock = jest.fn().mockResolvedValue(true);
    useAssistantChat.mockReturnValue({
      messages: [
        {
          id: "assistant",
          role: "assistant",
          content: "환영합니다",
          createdAt: Date.now(),
        },
      ],
      isSending: false,
      error: null,
      sendMessage: sendMessageMock,
      resetConversation: jest.fn(),
      clearConversation: jest.fn(),
    });
    useAuth.mockReturnValue({ user: { id: "user-1" }, isGuest: false });

    render(<AssistantWidget />);
    fireEvent.click(screen.getByRole("button", { name: /ai 질문하기/i }));

    const textarea = screen.getByPlaceholderText(/궁금한 내용을 물어보세요/i);
    fireEvent.change(textarea, { target: { value: "ETF가 무엇인가요?" } });
    fireEvent.click(screen.getByRole("button", { name: "전송" }));

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith("ETF가 무엇인가요?");
      expect((textarea as HTMLTextAreaElement).value).toBe("");
    });
  });

  it("renders typing indicator while waiting for assistant response", () => {
    useAssistantChat.mockReturnValue({
      messages: [
        {
          id: "user-msg",
          role: "user",
          content: "테스트",
          createdAt: Date.now(),
        },
      ],
      isSending: true,
      error: null,
      sendMessage: jest.fn(),
      resetConversation: jest.fn(),
      clearConversation: jest.fn(),
    });
    useAuth.mockReturnValue({ user: { id: "user-1" }, isGuest: false });

    render(<AssistantWidget />);
    fireEvent.click(screen.getByRole("button", { name: /ai 질문하기/i }));

    expect(
      screen.getByTestId("assistant-typing-indicator")
    ).toBeInTheDocument();
  });

  it("shows greeting loader before initial message when history is empty", () => {
    jest.useFakeTimers();
    const resetConversationMock = jest.fn();
    const clearConversationMock = jest.fn();
    useAssistantChat.mockReturnValue({
      messages: [],
      isSending: false,
      error: null,
      sendMessage: jest.fn(),
      resetConversation: resetConversationMock,
      clearConversation: clearConversationMock,
    });
    useAuth.mockReturnValue({ user: { id: "user-1" }, isGuest: false });

    try {
      render(<AssistantWidget />);
      fireEvent.click(screen.getByRole("button", { name: /ai 질문하기/i }));

      expect(
        screen.getByTestId("assistant-typing-indicator")
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(800);
      });

      expect(resetConversationMock).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
