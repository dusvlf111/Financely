"use client"
import React, { useState } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'

export default function MyPage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [editing, setEditing] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  function save() {
    if (updateProfile) updateProfile({ name })
    setEditing(false)
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">마이페이지</h1>
      <section className="bg-white border rounded-md p-4">
        <h2 className="font-medium">프로필</h2>
        <div className="mt-2 text-sm text-neutral-700">이름: {user ? user.name : '비회원'}</div>
        <div className="mt-1 text-sm text-neutral-700">골드: {user ? `${user.gold}G` : '—'}</div>

        <div className="mt-4">
          <h3 className="font-medium">프로필 편집</h3>
          {editing ? (
            <div className="mt-2 space-y-2">
              <input className="w-full border px-3 py-2 rounded-md" value={name} onChange={e => setName(e.target.value)} />
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-primary-600 text-black rounded" onClick={save}>저장</button>
                <button className="px-3 py-2 bg-neutral-100 rounded" onClick={() => setEditing(false)}>취소</button>
              </div>
            </div>
          ) : (
            <button className="mt-2 px-3 py-2 bg-neutral-100 rounded" onClick={() => setEditing(true)}>프로필 편집</button>
          )}
        </div>
        <div className="mt-4">
          <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={handleLogout}>로그아웃</button>
        </div>
      </section>
    </div>
  )
}
