import React from 'react'
import SocialButton from '../../components/Auth/SocialButton'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-48 h-48 bg-secondary-500 rounded-full" />
      <h2 className="text-xl font-semibold">Financely에 오신 것을 환영합니다</h2>
      <div className="space-y-2 w-full max-w-xs">
        <SocialButton provider="google" />
        <SocialButton provider="naver" />
        <SocialButton provider="kakao" />
      </div>
    </div>
  )
}
