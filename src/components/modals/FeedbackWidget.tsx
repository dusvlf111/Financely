"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "bug", label: "버그/오류" },
  { value: "ux", label: "불편한 UX" },
  { value: "improvement", label: "개선 아이디어" },
  { value: "other", label: "기타 의견" },
];

const SEVERITY_OPTIONS = [
  { value: "major", label: "심각함" },
  { value: "minor", label: "경미함" },
  { value: "suggestion", label: "수정 필요함" },
];

const DEFAULT_FORM = {
  category: "bug",
  severity: "major",
  summary: "",
  description: "",
  reproductionSteps: "",
  contactEmail: "",
  allowFollowUp: false,
};

type FormState = typeof DEFAULT_FORM;

type SubmissionState = "idle" | "success" | "error";

function collectClientDiagnostics() {
  if (typeof window === "undefined") {
    return { environment: "server" };
  }

  const nav = navigator as Navigator & {
    connection?: {
      downlink?: number;
      effectiveType?: string;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const connectionInfo = nav.connection
    ? {
        downlink: nav.connection.downlink ?? null,
        effectiveType: nav.connection.effectiveType ?? null,
        rtt: nav.connection.rtt ?? null,
        saveData: nav.connection.saveData ?? null,
      }
    : null;

  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: nav.languages,
    hardwareConcurrency: (nav as Navigator).hardwareConcurrency ?? null,
    deviceMemory:
      (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen:
      typeof screen !== "undefined"
        ? {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
          }
        : null,
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    connection: connectionInfo,
    cookiesEnabled: nav.cookieEnabled,
    localStorageEnabled: (() => {
      try {
        const key = "financely_storage_test";
        window.localStorage.setItem(key, "1");
        window.localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorageEnabled: (() => {
      try {
        const key = "financely_session_test";
        window.sessionStorage.setItem(key, "1");
        window.sessionStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })(),
    collectedAt: new Date().toISOString(),
  };
}

function collectLocalStorageDump() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const snapshot: Record<string, string | null> = {};
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      snapshot[key] = window.localStorage.getItem(key);
    }
    return snapshot;
  } catch (error) {
    console.warn("Failed to read localStorage for feedback", error);
    return null;
  }
}

export default function FeedbackWidget() {
  const { user, isGuest, profile } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const appVersion = useMemo(
    () => process.env.NEXT_PUBLIC_APP_VERSION ?? "demo",
    []
  );

  useEffect(() => {
    setDeviceInfo(collectClientDiagnostics());
  }, []);

  const toggleOpen = useCallback(() => {
    setSubmissionState("idle");
    setSubmissionMessage(null);
    setError(null);
    setIsOpen((prev) => !prev);
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof FormState) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>
          | React.ChangeEvent<HTMLSelectElement>
      ) => {
        const value =
          event.target.type === "checkbox"
            ? (event.target as HTMLInputElement).checked
            : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  const resetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
  }, []);

  const canSubmit = form.summary.trim().length > 0;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) {
        setError("필수 항목을 모두 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSubmissionState("idle");
      setSubmissionMessage(null);

      try {
        const localStorageDump = collectLocalStorageDump();
        const payload = {
          ...form,
          reproductionSteps: form.reproductionSteps.trim() || null,
          contactEmail: form.contactEmail.trim() || null,
          allowFollowUp: Boolean(form.allowFollowUp),
          deviceInfo,
          route: pathname,
          appVersion,
          isGuest,
          userContext: {
            localStorage: localStorageDump,
          },
        };

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (user?.id) {
          headers["x-user-id"] = user.id;
        }

        const response = await fetch("/api/feedback", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.error?.message ?? "피드백을 전송할 수 없습니다."
          );
        }

        setSubmissionState("success");
        setSubmissionMessage("소중한 의견이 접수되었습니다. 감사합니다!");
        resetForm();
        formRef.current?.reset();
      } catch (submitError) {
        console.error("Failed to submit feedback", submitError);
        setSubmissionState("error");
        setSubmissionMessage(
          submitError instanceof Error
            ? submitError.message
            : "피드백 저장 중 오류가 발생했습니다."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      appVersion,
      canSubmit,
      deviceInfo,
      form,
      isGuest,
      pathname,
      resetForm,
      user?.id,
    ]
  );

  return (
    <div className="fixed bottom-25 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          id="feedback-widget"
          className="w-96 max-w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl widget-pop-in"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                피드백 보내기
              </p>
              <p className="text-xs text-neutral-500">
                현재 Financely는 데모 버전입니다. 불편한 점이나 개선 아이디어를
                알려주시면 출시 시 품질 개선에 큰 도움이 됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              aria-label="피드백 창 닫기"
            >
              ✕
            </button>
          </div>

          <form ref={formRef} className="space-y-1" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-neutral-600">
                유형
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                  value={form.category}
                  onChange={handleFieldChange("category")}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-neutral-600">
                영향도
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                  value={form.severity}
                  onChange={handleFieldChange("severity")}
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-xs font-medium text-neutral-600">
              제목 (필수)
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="간단한 요약을 입력해주세요"
                value={form.summary}
                onChange={handleFieldChange("summary")}
                maxLength={120}
                required
              />
            </label>

            <label className="text-xs font-medium text-neutral-600">
              상세 내용 (선택)
              <textarea
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="재현 방법, 기대 동작 등을 자유롭게 적어주세요"
                rows={2}
                value={form.description}
                onChange={handleFieldChange("description")}
                maxLength={1500}
              />
            </label>

            <label className="text-xs font-medium text-neutral-600">
              추가 정보 (선택)
              <textarea
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="추가로 공유하고 싶은 정보나 스크린샷 링크 등을 적어주세요"
                rows={2}
                value={form.reproductionSteps}
                onChange={handleFieldChange("reproductionSteps")}
                maxLength={1500}
              />
            </label>

            <div className="flex flex-col gap-2 text-xs text-neutral-600 mb-2">
              <label className="font-medium">
                이메일 (선택)
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="이메일 주소를 입력해주세요"
                  value={form.contactEmail}
                  onChange={handleFieldChange("contactEmail")}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={form.allowFollowUp}
                  onChange={handleFieldChange("allowFollowUp")}
                />
                이메일로 피드백의 회신을 받으시겠습니까?
              </label>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-600">
                기기의 일부 정보가 수집됩니다. 개인정보는 포함되지 않습니다.
              </p>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {submissionState !== "idle" && submissionMessage && (
              <p
                className={`text-xs ${
                  submissionState === "success"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {submissionMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-neutral-300"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "전송 중..." : "피드백 제출"}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-xl hover:bg-amber-500 duration-300 cursor-pointer"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="feedback-widget"
      >
        <Image
          src="/icons/message-circle-warning.svg"
          alt="Feedback"
          width={20}
          height={20}
        />
        피드백
      </button>
    </div>
  );
}
