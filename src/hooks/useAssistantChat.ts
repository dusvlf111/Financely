"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const MAX_MESSAGE_LENGTH = 400;

type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: number;
}

export interface UseAssistantChatOptions {
  userId?: string;
}

export interface UseAssistantChatResult {
  messages: AssistantMessage[];
  isSending: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<boolean>;
  resetConversation: () => void;
}

const createMessageId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function useAssistantChat(
  options: UseAssistantChatOptions = {}
): UseAssistantChatResult {
  const { userId } = options;
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);

  const hasUserSession = Boolean(userId);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setLastResponseId(null);
  }, [userId]);

  const resetConversation = useCallback(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: "안녕하세요? 금융 및 주식이 궁금하시다면, 저에게 물어보세요.",
        createdAt: Date.now(),
      },
    ]);
    setError(null);
    setLastResponseId(null);
  }, []);

  const sendMessage = useCallback(
    async (rawMessage: string): Promise<boolean> => {
      const trimmed = rawMessage.trim();

      if (!trimmed) {
        setError("메시지를 입력해주세요.");
        return false;
      }

      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError("메시지는 400자 이하여야 합니다.");
        return false;
      }

      const appendAssistantResponse = (content: string) => {
        const assistantEntry: AssistantMessage = {
          id: createMessageId(),
          role: "assistant",
          content: content.slice(0, MAX_MESSAGE_LENGTH),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantEntry]);
      };

      const userEntry: AssistantMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      if (!hasUserSession) {
        const assistantEntry: AssistantMessage = {
          id: createMessageId(),
          role: "assistant",
          content: "로그인 후 이용 가능합니다.",
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, userEntry, assistantEntry]);
        setError(null);
        return true;
      }

      setMessages((prev) => [...prev, userEntry]);
      setIsSending(true);
      setError(null);

      try {
        const requestBody: Record<string, unknown> = { message: trimmed };
        if (lastResponseId) {
          requestBody.previousResponseId = lastResponseId;
        }

        const response = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId as string,
          },
          body: JSON.stringify(requestBody),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload || !payload.data?.reply) {
          const message =
            payload?.error?.message ?? "AI 응답을 요청할 수 없습니다.";
          appendAssistantResponse(message);
          setError(null);
          return false;
        }

        const assistantEntry: AssistantMessage = {
          id: createMessageId(),
          role: "assistant",
          content: (payload.data.reply as string).slice(0, MAX_MESSAGE_LENGTH),
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, assistantEntry]);
        setLastResponseId(payload.data.responseId ?? null);
        setError(null);
        return true;
      } catch (sendError) {
        console.error("Failed to call assistant API", sendError);
        appendAssistantResponse(
          "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
        setError(null);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [hasUserSession, userId, lastResponseId]
  );

  return useMemo(
    () => ({
      messages,
      isSending,
      error,
      sendMessage,
      resetConversation,
    }),
    [messages, isSending, error, sendMessage, resetConversation]
  );
}
