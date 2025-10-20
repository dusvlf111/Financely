"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function MyPage() {
  const { profile, updateProfile, logout } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  async function save() {
    if (updateProfile) await updateProfile({ username })
    setEditing(false)
  }

  async function handleDeleteAccount() {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 모든 데이터는 영구적으로 삭제되며 복구할 수 없습니다.')) {
      const { error } = await supabase.rpc('delete_user')
      if (error) {
        alert(`계정 삭제 중 오류가 발생했습니다: ${error.message}`)
      } else {
        alert('계정이 성공적으로 삭제되었습니다.')
        handleLogout()
      }
    }
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">마이페이지</h1>
      <section className="bg-white border rounded-lg p-6">
        <h2 className="font-medium text-lg mb-4">프로필</h2>
        <div className="mt-2 text-sm text-neutral-700">이름: {profile ? (profile.username || profile.full_name) : '비회원'}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-700">
          <span>골드:</span>
          <div className="flex items-center gap-1">
            <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
            <span>{profile ? `${profile.gold.toLocaleString()}` : '—'}</span>
          </div>
        </div>

        <div className="mt-4">
          {/* <h3 className="font-medium">프로필 편집</h3> */}
          {editing ? (
            <div className="mt-2 space-y-2">
              <input className="w-full border px-3 py-2 rounded-md" value={username} onChange={e => setUsername(e.target.value)} placeholder="사용자 이름" />
              <div className="flex gap-2">
                <button className="btn-primary" onClick={save}>저장</button>
                <button className="btn-secondary" onClick={() => setEditing(false)}>취소</button>
              </div>
            </div>
          ) : (
            <button className="mt-2 btn-secondary" onClick={() => setEditing(true)}>프로필 편집</button>
          )}
        </div>
        <div className="mt-6 border-t pt-6">
          <button className="btn-danger" onClick={handleLogout}>로그아웃</button>
          <button className="mt-2 text-sm text-neutral-500 underline" onClick={handleDeleteAccount}>회원 탈퇴</button>
        </div>
      </section>
    </div>
  )
}
