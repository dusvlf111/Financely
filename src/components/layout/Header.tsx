import React from 'react'

export default function Header() {
  return (
    <header className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Financely</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>🔥</span>
          <span className="text-sm">6</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💰</span>
          <span className="text-sm">1,240</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚡</span>
          <span className="text-sm">●●●○○</span>
        </div>
      </div>
    </header>
  )
}
