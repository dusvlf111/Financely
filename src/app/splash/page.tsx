"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/learn')
    }, 3000) // 3초 후 /learn 페이지로 이동

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-500">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white tracking-widest">
          {'Financely'.split('').map((char, index) => (
            <span key={index} className="inline-block jello-horizontal" style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  )
}