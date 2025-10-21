"use client"
import React, { useState } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import ConfirmModal from '@/components/modals/ConfirmModal'
import SuccessModal from '@/components/modals/SuccessModal'

type ShopItem = {
  id: string
  name: string
  description: string
  price: number
  enabled: boolean
  comingSoon?: boolean
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'reset_progress',
    name: '진행도 리셋',
    description: '모든 문제를 처음부터 다시 풀 수 있습니다. 골드는 유지됩니다.',
    price: 2000,
    enabled: true,
  },
  {
    id: 'unlock_category',
    name: '카테고리 해금',
    description: '원하는 카테고리를 먼저 학습할 수 있습니다.',
    price: 3000,
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'skip_problem',
    name: '문제 스킵',
    description: '어려운 문제를 건너뛸 수 있습니다.',
    price: 500,
    enabled: false,
    comingSoon: true,
  },
]

export default function ShopPage() {
  const { user, profile, spendGold } = useAuth()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; item: ShopItem | null }>({
    open: false,
    item: null,
  })
  const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })

  function handlePurchaseClick(item: ShopItem) {
    if (!user || !profile) {
      setSuccessModal({ open: true, message: '로그인이 필요합니다.' })
      return
    }

    if (profile.gold < item.price) {
      setSuccessModal({ open: true, message: '골드가 부족합니다.' })
      return
    }

    if (!item.enabled) {
      setSuccessModal({ open: true, message: '준비 중인 아이템입니다.' })
      return
    }

    setConfirmModal({ open: true, item })
  }

  async function handleConfirmPurchase() {
    if (!confirmModal.item || !user) return

    const item = confirmModal.item
    setPurchasing(item.id)

    try {
      if (item.id === 'reset_progress') {
        // 진행도 리셋 아이템 구매
        const success = await spendGold?.(item.price)
        if (!success) {
          setSuccessModal({ open: true, message: '골드 차감에 실패했습니다.' })
          setPurchasing(null)
          return
        }

        // user_solved_problems 테이블의 모든 데이터 삭제
        const { error } = await supabase
          .from('user_solved_problems')
          .delete()
          .eq('user_id', user.id)

        if (error) {
          setSuccessModal({
            open: true,
            message: `진행도 리셋에 실패했습니다:\n${error.message}`
          })
        } else {
          setSuccessModal({
            open: true,
            message: '진행도가 리셋되었습니다!\n골드는 유지되었습니다.'
          })
          // 성공 모달 닫힌 후 페이지 새로고침
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setSuccessModal({ open: true, message: '구매 중 오류가 발생했습니다.' })
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-2">상점</h1>
      <p className="text-sm text-neutral-600 mb-6">특별한 아이템으로 학습을 더 효율적으로!</p>

      {/* 보유 골드 */}
      <div className="bg-white border rounded-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">보유 골드</span>
          <div className="flex items-center gap-1">
            <Image src="/icons/gold_icon.svg" alt="Gold" width={20} height={20} className="w-5 h-5" />
            <span className="text-lg font-bold text-neutral-900">
              {profile ? profile.gold.toLocaleString() : '—'}G
            </span>
          </div>
        </div>
      </div>

      {/* 아이템 목록 */}
      <div className="space-y-4">
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-md p-5 ${!item.enabled ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                  {item.comingSoon && (
                    <span className="px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs rounded">
                      준비중
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
                <span className="font-bold text-neutral-900">{item.price.toLocaleString()}G</span>
              </div>
              <button
                onClick={() => handlePurchaseClick(item)}
                disabled={!item.enabled || purchasing === item.id}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  item.enabled
                    ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50'
                    : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {purchasing === item.id ? '구매 중...' : item.enabled ? '구매하기' : '준비중'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 문구 */}
      <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-md">
        <p className="text-xs text-neutral-600">
          💡 아이템 구매 시 골드가 차감되며, 구매 후 취소는 불가능합니다.
        </p>
      </div>

      {/* 모달들 */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, item: null })}
        onConfirm={handleConfirmPurchase}
        title={confirmModal.item?.name || ''}
        description={`${confirmModal.item?.price.toLocaleString()}G에 구매하시겠습니까?\n\n${confirmModal.item?.description || ''}`}
        confirmText="구매하기"
        cancelText="취소"
      />

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ open: false, message: '' })}
        title="알림"
        description={successModal.message}
        buttonText="확인"
      />
    </div>
  )
}
