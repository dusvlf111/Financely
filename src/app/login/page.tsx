"use client"
import React, { useEffect } from 'react'
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-40 h-40 bg-secondary-500 rounded-full" />
      <h2 className="text-xl font-semibold">Financely에 오신 것을 환영합니다</h2>
      <p className="text-sm text-neutral-600">학습을 시작하려면 소셜 계정으로 로그인하세요</p>

      <div className="space-y-2 w-full max-w-xs">
        <SocialButton provider="google" onClick={() => handleSocialLogin('google')} />
        <SocialButton provider="naver" onClick={() => handleSocialLogin('naver')} />
        <SocialButton provider="kakao" onClick={() => handleSocialLogin('kakao')} />
      </div>

      <div className="mt-4 text-xs text-neutral-500">계속 진행하면 이용 약관 및 개인정보처리방침에 동의하게 됩니다.</div>
    </div>
  )
}
