"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SocialButton from "../../components/Auth/SocialButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest, user, isGuest } = useAuth();

  useEffect(() => {
    if (user || isGuest) router.replace("/learn");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest]);

  function handleSocialLogin(provider: string) {
    login(provider as "google" | "kakao" | "naver");
  }

  async function handleGuestLogin() {
    await loginAsGuest();
    router.replace("/learn");
  }

  function handleEmailLogin() {
    router.push("/login/email");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="card-scale-in p-8 bg-white/70 backdrop-blur-sm shadow-lg rounded-xl">
          {/* 로고 */}
          <div className="flex justify-center mb-6">
            <Image
              src="/icons/logo.png"
              alt="Financely"
              width={112}
              height={112}
              className="w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl font-bold text-primary-500 tracking-tight mb-2">
            Financely
          </h1>
          <h2 className="text-base font-medium text-neutral-600 mb-10">
            학습하며 쌓는 금융 자신감
          </h2>

          <div className="space-y-3">
            {/* SocialButton 컴포넌트가 provider에 따라 스타일을 내부적으로 처리한다고 가정합니다. */}
            <SocialButton
              provider="google"
              onClick={() => handleSocialLogin("google")}
            >
              구글로 시작하기
            </SocialButton>
            <SocialButton
              provider="naver"
              onClick={() => handleSocialLogin("naver 미구현")}
            >
              네이버로 시작하기
            </SocialButton>
            <SocialButton
              provider="kakao"
              onClick={() => handleSocialLogin("kakao")}
            >
              카카오로 시작하기
            </SocialButton>
            <button
              type="button"
              className="w-full rounded-xl border border-primary-200 px-4 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50"
              onClick={handleEmailLogin}
            >
              이메일로 시작하기
            </button>
            <button
              type="button"
              className="w-full px-4 py-3 rounded-xl border border-dashed border-primary-200 text-sm font-medium text-primary-600 bg-white/80 hover:bg-primary-50 transition-colors"
              onClick={handleGuestLogin}
            >
              게스트로 시작하기
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          회원 가입 없이도 체험이 가능하며, 게스트 데이터는 이 기기에만
          저장됩니다.
        </p>
      </div>
    </div>
  );
}
