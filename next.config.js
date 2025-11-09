const isDev = process.env.NODE_ENV === 'development'
const enablePWAInDev = process.env.NEXT_PUBLIC_PWA === '1'

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // 개발 환경에서도 NEXT_PUBLIC_PWA=1 이면 PWA 활성화
  disable: isDev && !enablePWAInDev,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}

module.exports = withPWA(nextConfig)
