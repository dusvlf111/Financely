import React from 'react'

const tabs = [
  { key: 'learn', label: '학습' },
  { key: 'league', label: '리그' },
  { key: 'quest', label: '퀘스트' },
  { key: 'asset', label: '자산' },
  { key: 'mypage', label: '마이' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-4 left-0 right-0">
      <div className="max-w-[768px] mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md flex justify-between py-2 px-6">
          {tabs.map((t) => (
            <button key={t.key} className="flex flex-col items-center text-xs">
              <div className="mb-1">●</div>
              <div>{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
