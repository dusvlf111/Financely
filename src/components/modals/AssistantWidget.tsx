"use client";

import { MAX_MESSAGE_LENGTH, useAssistantChat } from "@/hooks/useAssistantChat";
import { useAuth } from "@/lib/context/AuthProvider";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AssistantWidget() {
  const { user, isGuest } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const userId = !isGuest && user?.id ? user.id : undefined;
  const { messages, isSending, error, sendMessage, resetConversation } =
    useAssistantChat({
      userId,
    });

  const remainingChars = MAX_MESSAGE_LENGTH - inputValue.length;
  const effectiveError = localError ?? error;
  const [isGreetingLoading, setIsGreetingLoading] = useState(false);
  const greetingTimerRef = useRef<number | null>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value.slice(0, MAX_MESSAGE_LENGTH);
      setInputValue(nextValue);
      setLocalError(null);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      setLocalError(null);
      setIsGreetingLoading(false);
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
      return;
    }

    if (messages.length > 0) {
      setIsGreetingLoading(false);
      return;
    }

    if (greetingTimerRef.current) {
      return;
    }

    setIsGreetingLoading(true);
    greetingTimerRef.current = window.setTimeout(() => {
      resetConversation();
      setIsGreetingLoading(false);
      greetingTimerRef.current = null;
    }, 800);

    return () => {
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
    };
  }, [isOpen, messages.length, resetConversation]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setLocalError("메시지를 입력해주세요.");
      return;
    }

    setLocalError(null);
    setInputValue("");
    const success = await sendMessage(trimmed);
    if (success) {
      setInputValue("");
    }
  }, [inputValue, sendMessage]);

  useEffect(() => {
    if (!chatBoxRef.current) return;
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-37 right-6 z-30 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          id="assistant-widget"
          className="w-80 max-w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl widget-pop-in"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-neutral-900">
              AI 금융 어시스턴트
            </p>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div
            className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-3 h-[280px]"
            data-testid="assistant-messages"
            ref={chatBoxRef}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap chat-bubble-appear ${
                  message.role === "user"
                    ? "bg-blue-50 text-blue-800 ml-6"
                    : "bg-neutral-100 text-neutral-800 mr-6"
                }`}
              >
                {message.content}
              </div>
            ))}
            {(isSending || isGreetingLoading) && (
              <div
                className="mr-6 flex items-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 h-9 chat-bubble-appear"
                data-testid="assistant-typing-indicator"
                aria-live="polite"
              >
                <span className="sr-only">답변 작성 중</span>
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-neutral-400/80 animate-bounce"
                    style={{ animationDelay: `${dot * 130}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="assistant-input" className="sr-only">
              금융 질문 입력
            </label>
            <textarea
              id="assistant-input"
              className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="궁금한 내용을 물어보세요."
              maxLength={MAX_MESSAGE_LENGTH}
              rows={2}
              value={inputValue}
              onChange={handleInputChange}
              disabled={isSending}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
              {isSending ? (
                <span>전송 중…</span>
              ) : (
                <span>{remainingChars}자 남음</span>
              )}
              {effectiveError && (
                <span className="text-red-500">{effectiveError}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-neutral-300"
            onClick={handleSend}
            disabled={isSending}
          >
            전송
          </button>
        </div>
      )}

      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white shadow-xl hover:bg-primary-700 duration-300 cursor-pointer"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="assistant-widget"
      >
        <span role="img" aria-hidden="true">
          💬
        </span>
        AI 질문하기
      </button>
    </div>
  );
}
