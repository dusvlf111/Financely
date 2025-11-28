"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<FormState> & { terms?: string };

const emailPattern = /.+@.+\..+/;

export default function EmailSignupPage() {
  const router = useRouter();
  const { signUpWithEmail, isAuthLoading, user, isGuest } = useAuth();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isProcessing = useMemo(
    () => isSubmitting || isAuthLoading,
    [isAuthLoading, isSubmitting]
  );

  useEffect(() => {
    if (user || isGuest) {
      router.replace("/learn");
    }
  }, [isGuest, router, user]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "이메일을 입력해주세요";
    } else if (!emailPattern.test(form.email)) {
      nextErrors.email = "유효한 이메일 형식이 아니에요";
    }

    if (!form.password) {
      nextErrors.password = "비밀번호를 입력해주세요";
    } else if (form.password.length < 6) {
      nextErrors.password = "6자 이상 설정해주세요";
    }

    if (!agreed) {
      nextErrors.terms = "약관에 동의해주세요";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    setServerError(null);
    setSuccessMessage(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await signUpWithEmail(form.email.trim(), form.password);

    if (!result.success) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link
            href="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            ← 다른 로그인 방법으로 돌아가기
          </Link>
        </div>

        <div className="rounded-2xl bg-white/85 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-2 text-3xl font-bold text-primary-600">
            이메일로 회원가입
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                placeholder="you@example.com"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "signup-email-error" : undefined
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.email ? (
                <p
                  id="signup-email-error"
                  className="mt-1 text-xs text-red-500"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="최소 6자"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "signup-password-error" : undefined
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.password ? (
                <p
                  id="signup-password-error"
                  className="mt-1 text-xs text-red-500"
                >
                  {errors.password}
                </p>
              ) : null}
            </div>

            <label className="flex items-start gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <span>
                <strong>이용약관</strong>과 <strong>개인정보 처리방침</strong>에
                동의합니다.
              </span>
            </label>
            {errors.terms ? (
              <p className="-mt-3 text-xs text-red-500">{errors.terms}</p>
            ) : null}

            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-200"
            >
              {isProcessing ? "가입 진행 중..." : "회원가입"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login/email" className="font-semibold text-primary-600">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}
