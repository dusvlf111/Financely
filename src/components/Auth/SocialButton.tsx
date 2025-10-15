import React from 'react'

type SocialProvider = 'google' | 'naver' | 'kakao'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider
  label?: string
}

const providerLabels: Record<SocialProvider, string> = {
  google: '구글로 로그인',
  naver: '네이버로 로그인',
  kakao: '카카오로 로그인',
}

export default function SocialButton({ provider, label, className = '', ...rest }: Props) {
  const text = label ?? providerLabels[provider]
  return (
    <button
      type="button"
      aria-label={text}
      className={`w-full bg-white border rounded-md py-2 text-sm ${className}`}
      {...rest}
    >
      {text}
    </button>
  )
}
