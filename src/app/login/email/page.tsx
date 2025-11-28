"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const emailPattern = /.+@.+\..+/;

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<FormState>;

export default function EmailLoginPage() {
  const router = useRouter();
  const { loginWithEmail, isAuthLoading, user, isGuest } = useAuth();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
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
      nextErrors.password = "6자 이상 입력해주세요";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    setServerError(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithEmail(form.email.trim(), form.password);
    if (!result.success) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace("/learn");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            ← 다른 로그인 방법으로 돌아가기
          </Link>
        </div>

        <div className="rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
          <h1 className="mb-2 text-3xl font-bold text-primary-600">
            이메일로 로그인
          </h1>
          <p className="mb-6 text-sm text-neutral-500">
            가입 시 사용한 이메일과 비밀번호를 입력해주세요.
          </p>

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
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.email ? (
                <p id="email-error" className="mt-1 text-xs text-red-500">
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
                autoComplete="current-password"
                placeholder="비밀번호"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-neutral-200"
                }`}
              />
              {errors.password ? (
                <p id="password-error" className="mt-1 text-xs text-red-500">
                  {errors.password}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-200"
            >
              {isProcessing ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup/email" className="font-semibold text-primary-600">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
