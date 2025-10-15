import React from 'react'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-48 h-48 bg-secondary-500 rounded-full" />
      <h2 className="text-xl font-semibold">Financely에 오신 것을 환영합니다</h2>
      <div className="space-y-2 w-full max-w-xs">
        <button className="w-full bg-white border rounded-md py-2">구글로 로그인</button>
        <button className="w-full bg-white border rounded-md py-2">네이버로 로그인</button>
        <button className="w-full bg-white border rounded-md py-2">카카오로 로그인</button>
      </div>
    </div>
  )
}
