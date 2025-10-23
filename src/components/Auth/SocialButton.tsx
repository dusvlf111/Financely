"use client"
import React from 'react'
import { hapticSelection } from '@/lib/utils/haptic'

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

const providerClasses: Record<SocialProvider, string> = {
  google: 'btn-google',
  naver: 'btn-naver',
  kakao: 'btn-kakao',
}

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  // simple inline SVG placeholders to avoid external asset 404s
  if (provider === 'google')
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="0.5">
        <path d="M21.35 11.1h-9.2v2.8h5.3c-.23 1.4-1.42 3.4-5.3 3.4-3.18 0-5.78-2.62-5.78-5.84s2.6-5.84 5.78-5.84c1.8 0 3.02.77 3.72 1.44l2.54-2.45C17.28 3.02 15.47 2 12.15 2 6.87 2 2.64 6.2 2.64 11.5s4.23 9.5 9.51 9.5c5.49 0 9.14-3.84 9.14-9.24 0-.62-.06-1.1-.94-1.66z" fill="#4285F4" stroke="none" />
      </svg>
    )
  if (provider === 'naver')
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect width="23" height="23" x="0.5" y="0.5" rx="3.5" fill="#03C75A" stroke="#000000" strokeOpacity="0.1" />
        <path d="M7 6v12h3V9l6 9h3V6h-3v9l-6-9H7z" fill="#fff" />
      </svg>
    )
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="23" height="23" x="0.5" y="0.5" rx="3.5" fill="#F7E000" stroke="#000000" strokeOpacity="0.1" />
      <path d="M12 7a5 5 0 100 10 5 5 0 000-10z" fill="#3C1E1E" />
    </svg>
  )
}

export default function SocialButton({ provider, label, className = '', ...rest }: Props) {
  const buttonText = rest.children || providerLabels[provider]

  return (
    <button
      type="button"
      aria-label={String(buttonText)}
      className={`btn-social ${providerClasses[provider]} ${className}`}
      onClick={(e) => {
        hapticSelection()
        if (rest.onClick) rest.onClick(e)
      }}
      {...rest}
    >
      <ProviderIcon provider={provider} />
      <span className="flex-1">{buttonText}</span>
    </button>
  )
}
