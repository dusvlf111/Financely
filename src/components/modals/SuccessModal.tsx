"use client"
import React from 'react'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  buttonText?: string
}

export default function SuccessModal({
  open,
  onClose,
  title,
  description,
  buttonText = '확인',
}: SuccessModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 card-scale-in-fast">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-neutral-600 whitespace-pre-line">
            {description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
