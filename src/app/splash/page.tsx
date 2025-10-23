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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 overflow-hidden">
      {/* 배경 원형 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate__animated animate__pulse animate__infinite animate__slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate__animated animate__pulse animate__infinite animate__slower" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 로고 컨테이너 */}
      <div className="relative text-center z-10">
        {/* 로고 배경 원 - 크게 확장 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/20 rounded-full animate__animated animate__zoomIn"></div>
        
        {/* 메인 로고 텍스트 */}
        <div className="animate__animated animate__fadeIn animate__delay-1s">
          <h1 className="text-4xl font-bold text-white tracking-wider mb-4 drop-shadow-2xl">
            {'Financely'.split('').map((char, index) => (
              <span 
                key={index} 
                className="inline-block animate__animated animate__fadeInDown"
                style={{ 
                  animationDelay: `${0.5 + index * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              >
                {char}
              </span>
            ))}
          </h1>
          
          {/* 서브 타이틀 */}
          <p className="text-white/90 text-sm tracking-widest animate__animated animate__fadeIn animate__delay-2s">
            금융 지식의 시작
          </p>
        </div>

        {/* 로딩 인디케이터 */}
        <div className="mt-8 animate__animated animate__fadeIn animate__delay-2s">
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate__animated animate__bounce animate__infinite" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate__animated animate__bounce animate__infinite" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate__animated animate__bounce animate__infinite" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}