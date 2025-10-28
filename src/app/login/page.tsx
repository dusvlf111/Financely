"use client"
import React, { useEffect } from 'react'
import Image from 'next/image'
import SocialButton from '../../components/Auth/SocialButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) router.replace('/learn')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function handleSocialLogin(provider: string) {
    login(provider as 'google' | 'kakao' | 'naver')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="card-scale-in p-8 bg-white/70 backdrop-blur-sm shadow-lg rounded-xl">
          {/* 로고 */}
          <div className="flex justify-center mb-6">
            <Image
              src="/favicon/apple-icon-180x180.png"
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
            <SocialButton provider="google" onClick={() => handleSocialLogin('google')}>Google로 시작하기</SocialButton>
            <SocialButton provider="naver" onClick={() => handleSocialLogin('naver 미구현')}>Naver로 시작하기</SocialButton>
            <SocialButton provider="kakao" onClick={() => handleSocialLogin('kakao')}>Kakao로 시작하기</SocialButton>
          </div>
        </div>
        <p className="mt-6 text-xs text-neutral-500">계속 진행하면 이용 약관 및 개인정보처리방침에 동의하게 됩니다.</p>
      </div>
    </div>
  )
}
